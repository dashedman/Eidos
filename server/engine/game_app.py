import asyncio
import json
import logging
import random
import time
import multiprocessing

import websockets
from websockets.server import WebSocketServerProtocol

from .config import GameConfig
from .entities.users import UsersManager
from .logic import GameLogicEngine
from .map import Map
from .physics import PhysicsEngine
from .session import SessionInfo
from .user import User


class GameFrontend:

    def __init__(self, config: GameConfig):
        self.config = config
        self.last_frame_time = 0
        self.user_sessions: dict[WebSocketServerProtocol, User] = {}
        self.logger = logging.getLogger('GameApp')

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

    async def main_loop(self):
        time_delta = self.TIME_FOR_FRAME
        while True:
            await asyncio.sleep(self.TIME_FOR_FRAME - time_delta)
            frame_time = time.perf_counter()
            time_delta = frame_time - self.last_frame_time
            # calc physic

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

    async def safe_send(self, key, user, data):
        try:
            await user.send(data)
        except websockets.ConnectionClosedOK:
            del self.user_sessions[key]


class GameBackend:
    TIME_FOR_FRAME = 0.1

    def __init__(self, queue: multiprocessing.Queue):
        self.alive = False
        self.last_frame_time = 0
        self.logger = logging.getLogger('GameLoop')

        self.map = Map()

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
        pass
