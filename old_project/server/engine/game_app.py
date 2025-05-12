import asyncio
import json
import logging
import queue
import time
import multiprocessing
from enum import IntEnum
from pathlib import Path
from typing import Any

import pytiled_parser
import websockets
from pytiled_parser import Tileset
from tqdm import tqdm
from websockets.server import WebSocketServerProtocol

from .config import GameConfig
from .entities import UsersManager, User
from .logic import GameLogicEngine
from .map import Map, Cell
from .physics import PhysicsEngine, InertiaBoxColliderMultiprocess
from . import server
from .session import SessionInfo
from .tileset import TileSetRegistry
from .user import UserSession, UserPosition, UserPositionKeys
from .utils.shared_types import SharedFloat, SharedBoolList


def session_id_gen(max_id: int = 10000):
    while 1:
        yield from range(1, max_id)


def init_player_meta(player_meta: list[dict[str, Any]]):
    User.landing_duration = next(
        p['sprite_meta']['animation_duration']
        for p in player_meta if p['state_name'] == 'LandingState'
    ) / 1000
    User.windup_duration = next(
        p['sprite_meta']['animation_duration']
        for p in player_meta if p['state_name'] == 'WindupState'
    ) / 1000


class QueueCode(IntEnum):
    NewUser = 1
    TakeMap = 2
    UpdateTileSet = 3
    DeleteUser = 4
    InitMeta = 100


class GameFrontend:
    FRONTEND_FREQUENCY = 0.1

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

        # TODO: maybe move to some character manager init func
        self.logger.info('Start loading character animations from files')
        anim_chars_folder = Path('../resources/animations')
        for anim_data in tqdm(anim_chars_folder.glob('**/*.tsj')):
            anim_tilesets = pytiled_parser.parse_tileset(anim_data)
            self.tilesets.update_one(anim_tilesets, anim_data.parent)

        player_meta = self.config.sprites_meta['player']
        init_player_meta(player_meta)
        queue_to_backend.put_nowait((QueueCode.InitMeta, player_meta))

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
            'type': server.MessageCode.Init,
            'data': {
                'id': new_user.session.id,
                'tilesets': self.tilesets.registry_data,
                'chunk_size': Map.CHUNK_SIZE,
                'skin_sets': self.config.sprites_meta,
            }
        }
        await websocket.send(json.dumps(register_successful_data))
        print(len(self.user_sessions), 'USERS!!!')
        return new_user

    async def unregister_session(self, user_session: UserSession):
        user_session.position.close()
        user_session.input_registry.close()
        self.queue_to_backend.put_nowait((QueueCode.DeleteUser, user_session.session.id))
        del self.user_sessions[user_session.session.id]
        print(len(self.user_sessions), 'u USERS!!!')

    async def run_loop(self):
        while True:
            await asyncio.sleep(self.FRONTEND_FREQUENCY)
            async_tasks = self.check_backend_messages()

            # send positions to all users
            positions = [
                {
                    'id': user.session.id,
                    'x': user.position.x.read(),
                    'y': user.position.y.read(),
                    'vx': user.position.vx.read(),
                    'vy': user.position.vy.read(),
                } for user in self.user_sessions.values()
            ]
            position_data = {
                'type': server.MessageCode.Positions,
                'data': {
                    'positions': positions
                }
            }
            data = json.dumps(position_data)

            async_tasks.extend(
                self.safe_send(user, data)
                for user in self.user_sessions.values()
            )
            if async_tasks:
                await asyncio.gather(*async_tasks)

    def check_backend_messages(self):
        async_tasks = []
        while not self.queue_from_backend.empty():
            try:
                response_code, request_data = self.queue_from_backend.get_nowait()
            except queue.Empty:
                # it can't be, because we in the while loop
                continue

            match response_code:
                case QueueCode.TakeMap:
                    request_data: tuple[int, list[Cell]]
                    session_id, list_of_cell = request_data

                    user_session = self.user_sessions.get(session_id)
                    if user_session is None:
                        print('us empty for', session_id, list(self.user_sessions.keys()))
                        continue

                    async_tasks.append(
                        self.safe_send(user_session, json.dumps({
                            'type': server.MessageCode.Map,
                            'data': [
                                {
                                    'tid': cell.tile_id,
                                    'x': cell.ph_collider.x,
                                    'y': cell.ph_collider.y,
                                    'rotate_bits': cell.rotate_bits
                                }
                                for cell in list_of_cell
                            ]
                        }))
                    )
                case QueueCode.UpdateTileSet:
                    request_data: tuple[dict[int, pytiled_parser.Tileset], Path, bool]
                    self.tilesets.update(*request_data)
        return async_tasks

    def spawn_user(self, user: UserSession):
        x_coord_cell = SharedFloat.from_float()
        y_coord_cell = SharedFloat.from_float()
        vx_coord_cell = SharedFloat.from_float()
        vy_coord_cell = SharedFloat.from_float()
        position = UserPosition(
            x=x_coord_cell,
            y=y_coord_cell,
            vx=vx_coord_cell,
            vy=vy_coord_cell,
        )
        pos_keys = position.to_user_position_keys()
        self.queue_to_backend.put_nowait((
            QueueCode.NewUser,
            (
                user.session.id,
                pos_keys,
                user.input_registry.command_flags.name
            )
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
            queue_from_frontend: multiprocessing.Queue,
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

    @classmethod
    def init_n_run(
            cls,
            queue_to_frontend: multiprocessing.Queue,
            queue_from_frontend: multiprocessing.Queue,
    ):
        backend = cls(queue_to_frontend, queue_from_frontend)
        backend.run_loop()

    def run_loop(self):
        self.alive = True
        time_delta = self.TIME_FOR_FRAME

        while self.alive:
            time.sleep(max(0.0, self.TIME_FOR_FRAME - time_delta))
            frame_time = time.perf_counter()
            time_delta = frame_time - self.last_frame_time
            # check new messages in queue
            self.check_frontend_messages()

            # calc physic
            self.physic.tick(time_delta)

            # calc logic
            self.logic.tick(time_delta)

            self.last_frame_time = frame_time

    def check_frontend_messages(self):
        while not self.queue_from_frontend.empty():
            request_code, request_data = self.queue_from_frontend.get_nowait()
            match request_code:
                case QueueCode.NewUser:
                    request_data: tuple[int, UserPositionKeys, str]
                    session_id, user_position_keys, command_flags_name = request_data

                    command_flags = SharedBoolList.from_name(command_flags_name)
                    user_position = user_position_keys.to_user_position()

                    user_collider = InertiaBoxColliderMultiprocess(
                        x=user_position.x,
                        y=user_position.y,
                        width=1,
                        height=1.8,
                        vx=user_position.vx,
                        vy=user_position.vy,
                    )
                    user = User(session_id, user_collider, command_flags)
                    # resolve place for user in room
                    fixed_x, fixed_y = self.map.find_place_for(user.ph_collider)
                    user.ph_collider.set_x(fixed_x)
                    user.ph_collider.set_y(fixed_y)

                    self.users.add(user)

                case QueueCode.DeleteUser:
                    request_data: int
                    user = next(u for u in self.users if u.session_id == request_data)
                    self.users.remove(user)
                case QueueCode.InitMeta:
                    request_data: list[dict[str, Any]]
                    init_player_meta(request_data)

    def update_tileset(
            self,
            tilesets: dict[int, Tileset],
            tileset_path: Path = None,
            ignore_class_none: bool = False,
    ):
        self.queue_to_frontend.put_nowait((
            QueueCode.UpdateTileSet,
            (tilesets, tileset_path, ignore_class_none)
        ))
