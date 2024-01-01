import asyncio
import ctypes
import json
import logging
import time
import multiprocessing
from enum import IntEnum
from typing import Any

import pytiled_parser
import websockets
from pytiled_parser import Tileset
from websockets.server import WebSocketServerProtocol

from .config import GameConfig
from .entities.users import UsersManager, User
from .logic import GameLogicEngine
from .map import Map, Cell
from .physics import PhysicsEngine, InertiaBoxColliderMultiprocess
from .server import MessageCode
from .session import SessionInfo
from .tileset import TileSetRegistry
from .user import UserSession, UserPosition


def session_id_gen(max_id: int = 10000):
    while 1:
        yield from range(1, max_id)


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
        self.user_sessions: dict[int, UserSession] = {}
        self.logger = logging.getLogger('GameApp')

        self.tilesets = TileSetRegistry()

        self.queue_to_backend = queue_to_backend
        self.queue_from_backend = queue_from_backend

        self.session_id_gen = session_id_gen()

    async def register_session(self, session_info: SessionInfo, websocket: WebSocketServerProtocol) -> UserSession | None:
        if session_info.version != self.config.version:
            await websocket.close(reason="Wrong version")
            return

        if session_info.id != 0:
            # find exist session for reconnect
            old_ws: WebSocketServerProtocol
            user: UserSession

            user = self.user_sessions.get(session_info.id)
            if user is not None:
                user.session = session_info
                return user

        session_info.id = next(self.session_id_gen)
        new_user = UserSession('', session_info, websocket)

        self.spawn_user(new_user)

        self.user_sessions[new_user.session.id] = new_user

        register_successful_data = {
            'type': MessageCode.Init,
            'data': {
                'id': new_user.session.id,
                'tilesets': self.tilesets.registry_data
            }
        }
        await websocket.send(json.dumps(register_successful_data))
        print(len(self.user_sessions), 'USERS!!!')
        return new_user

    async def run_loop(self):
        while True:
            await asyncio.sleep(0)
            async_tasks = self.check_backend_messages()

            # send positions to all users
            positions = [
                {
                    'id': user.session.id,
                    'x': user.position.x.value,
                    'y': user.position.y.value,
                    'vx': user.position.vx.value,
                    'vy': user.position.vy.value,
                } for user in self.user_sessions.values()
            ]
            position_data = {
                'type': MessageCode.Positions,
                'data': {
                    'positions': positions
                }
            }
            data = json.dumps(position_data)

            async_tasks.extend(
                self.safe_send(user, data)
                for user in self.user_sessions.values()
            )
            await asyncio.wait(async_tasks)

    def check_backend_messages(self):
        async_tasks = []
        while self.queue_from_backend:
            response_code, request_data = self.queue_from_backend.get_nowait()
            match response_code:
                case QueueCode.TakeMap:
                    request_data: tuple[int, list[Cell]]
                    session_id, list_of_cell = request_data
                    user_session = self.user_sessions[session_id]

                    async_tasks.append(
                        self.safe_send(user_session, json.dumps({
                            'type': MessageCode.Map,
                            'data': [
                                {
                                    'tid': cell.tile_id,
                                    'x': cell.ph_collider.x,
                                    'y': cell.ph_collider.y,
                                }
                                for cell in list_of_cell
                            ]
                        }))
                    )
                case QueueCode.UpdateTileSet:
                    request_data: dict[int, pytiled_parser.Tileset]
                    self.tilesets.update(request_data)
        return async_tasks

    def spawn_user(self, user: UserSession):
        x_coord_cell = multiprocessing.Value(ctypes.c_double, lock=False)
        y_coord_cell = multiprocessing.Value(ctypes.c_double, lock=False)
        vx_coord_cell = multiprocessing.Value(ctypes.c_double, lock=False)
        vy_coord_cell = multiprocessing.Value(ctypes.c_double, lock=False)
        position = UserPosition(
            x=x_coord_cell,
            y=y_coord_cell,
            vx=vx_coord_cell,
            vy=vy_coord_cell,
        )
        self.queue_to_backend.put_nowait((
            QueueCode.NewUser,
            (position, user.input_registry.command_flags)
        ))
        user.position = position

    async def safe_send(self, user: UserSession, data):
        try:
            await user.send(data)
        except websockets.ConnectionClosedOK:
            del self.user_sessions[user.session.id]


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
                    request_data: tuple[int, tuple[UserPosition, list[bool]]]
                    session_id, (user_position, command_flags) = request_data
                    user_collider = InertiaBoxColliderMultiprocess(
                        x=user_position.x,
                        y=user_position.y,
                        width=1,
                        height=1.8,
                        vx=user_position.vx,
                        vy=user_position.vy,
                    )
                    self.users.add(User(session_id, user_collider, command_flags))

    def update_tileset(self, tilesets: dict[int, Tileset]):
        self.queue_to_frontend.put_nowait((QueueCode.UpdateTileSet, tilesets))
