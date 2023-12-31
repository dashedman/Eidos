import asyncio
import json
import logging
import random
import time
import multiprocessing
from enum import IntEnum
from typing import Any

import websockets
from pytiled_parser import Tileset
from websockets.server import WebSocketServerProtocol

from .config import GameConfig
from .entities.users import UsersManager
from .logic import GameLogicEngine
from .map import Map
from .physics import PhysicsEngine
from .session import SessionInfo
from .tileset import TileSetRegistry
from .user import User





class QueueCode(IntEnum):
    NewUser = 1
    TakeMap = 2
    UpdateTileSet = 3


class GameFrontend:

    def __init__(
            self,
            config: GameConfig,
            queue_to_backend: multiprocessing.Queue,
            queue_from_backend: multiprocessing.Queue,
    ):
        self.config = config
        self.last_frame_time = 0
        self.user_sessions: dict[WebSocketServerProtocol, User] = {}
        self.logger = logging.getLogger('GameApp')

        self.tilesets = TileSetRegistry()

        self.queue_to_backend = queue_to_backend
        self.queue_from_backend = queue_from_backend

    async def register_session(self, session_info: SessionInfo, websocket: WebSocketServerProtocol) -> User | None:
        if session_info.version != self.config.version:
            await websocket.close(reason="Wrong game version")
            return

        if session_info.id != 0:
            # find exist session for reconnect
            old_ws: WebSocketServerProtocol
            user: User

            old_ws, user = next((
                (ws, us) for ws, us in self.user_sessions.items()
                if us.session.id == session_info.id
            ), (None, None))

            if user is not None:
                user.session = session_info
                return user

        session_info.id = random.randint(1, 1000)
        new_user = User('', session_info, websocket)
        self.user_sessions[websocket] = new_user

        reqister_succesfull_data = {
            'case': 'session',
            'data': {
                'id': new_user.session.id
            }
        }
        await websocket.send(json.dumps(reqister_succesfull_data))
        print(len(self.user_sessions), 'USERS!!!')
        return new_user

    async def run_loop(self):
        while True:
            await asyncio.sleep(0)

            self.check_backend_messages()

            # send positions to all users
            positions = [
                {
                    'id': user.session.id,
                    'x': user.coords.x,
                    'y': user.coords.y,
                } for user in self.user_sessions.values()
            ]
            position_data = {
                'case': 'positions',
                'data': {
                    'positions': positions
                }
            }
            data = json.dumps(position_data)
            await asyncio.gather(*(
                self.safe_send(ws_key, user, data)
                for ws_key, user in self.user_sessions.items()
            ))

    def check_backend_messages(self):
        while self.queue_from_backend:
            response_code, request_data = self.queue_from_backend.get_nowait()
            match response_code:
                case QueueCode.TakeMap:
                    pass
                case QueueCode.UpdateTileSet:
                    self.tilesets.update(request_data)

    async def safe_send(self, key, user, data):
        try:
            await user.send(data)
        except websockets.ConnectionClosedOK:
            del self.user_sessions[key]


class GameBackend:
    TIME_FOR_FRAME = 0.1

    def __init__(
            self,
            queue_to_frontend: multiprocessing.Queue,
            queue_from_frontend: multiprocessing.Queue[tuple[QueueCode, Any]],
    ):
        self.alive = False
        self.last_frame_time = 0
        self.logger = logging.getLogger('GameLoop')

        self.queue_to_frontend = queue_to_frontend
        self.queue_from_frontend = queue_from_frontend

        self.map = Map(self)

        self.physic = PhysicsEngine(self)
        self.logic = GameLogicEngine(self)

        self.users = UsersManager()

    def run_loop(self):
        self.alive = True
        time_delta = self.TIME_FOR_FRAME

        while self.alive:
            time.sleep(self.TIME_FOR_FRAME - time_delta)
            frame_time = time.perf_counter()
            time_delta = frame_time - self.last_frame_time
            # check new messages in queue
            self.check_frontend_messages()

            # calc physic
            self.physic.tick(time_delta)

            # calc logic
            self.logic.tick(time_delta)

    def check_frontend_messages(self):
        while self.queue_from_frontend:
            request_code, request_data = self.queue_from_frontend.get_nowait()
            match request_code:
                case QueueCode.NewUser:
                    raise NotImplementedError

    def update_tileset(self, tilesets: dict[int, Tileset]):
        self.queue_to_frontend.put_nowait((QueueCode.UpdateTileSet, tilesets))
