import asyncio
import json
import logging
import os
from dataclasses import dataclass
from enum import IntEnum
from multiprocessing import Process, Queue
from urllib.parse import unquote

import websockets
import websockets.server

import sanic
import sanic.response
import sanic.server
from sanic.request import Request

from . import logger
from .game_app import GameFrontend, GameBackend
from .config import ServerConfig
from .session import SessionInfo


class MessageCode(IntEnum):
    Init = 0
    Positions = 1
    Map = 2


@dataclass(kw_only=True)
class FrontendInfo:
    front_folder: str
    resources_folder: str
    index: str
    favicon: str
    js: str
    css: str


class Server:
    loop: asyncio.AbstractEventLoop

    frontend: GameFrontend
    http_app: sanic.Sanic
    http_server: sanic.server.AsyncioServer
    ws_server: websockets.server.WebSocketServer

    def __init__(self, config: ServerConfig):
        self.logger = logger.get_logger(config.logger)
        self.logger.setLevel(logging.INFO)
        self.config = config

        self.logger.info('Path to frontend part: %s', self.config.path_to_front)
        self.front_info = FrontendInfo(
            front_folder=self.config.path_to_front,
            resources_folder=self.config.path_to_resources,
            index=os.path.join(self.config.path_to_front, 'index.html'),
            favicon=os.path.join(self.config.path_to_front, 'favicon.ico'),
            js=os.path.join(self.config.path_to_front, 'js'),
            css=os.path.join(self.config.path_to_front, 'css'),
        )

        self.http_app = sanic.Sanic("GameServerApp")

        # load sprites meta
        path_to_sprites_meta = os.path.join(self.config.path_to_resources, 'game_config/sprites_meta.json')
        with open(path_to_sprites_meta, 'r') as f:
            self.config.game.sprites_meta = json.load(f)

        f_to_b_queue = Queue()
        b_to_f_queue = Queue()
        self.frontend = GameFrontend(self.config.game, f_to_b_queue, b_to_f_queue)
        self.backend_p = Process(target=GameBackend.init_n_run, name='BackendProcess', args=(b_to_f_queue, f_to_b_queue))

    async def run(self):
        self.loop = asyncio.get_running_loop()
        # add handler to route
        self.http_app.static("/", self.front_info.index, name='root')
        self.http_app.static("/favicon.ico", self.front_info.favicon, name='favicon')

        def add_routers(handler, suffix, depth=1):
            uri = suffix
            for i in range(depth):
                uri += f'/<path{i}>'
                self.http_app.add_route(handler, uri, name=suffix + str(i))

        add_routers(self.http_handler, '/js', 10)
        add_routers(self.http_handler, '/css', 3)
        add_routers(self.http_handler, '/shaders', 3)

        add_routers(self.http_handler, '/resources', 6)

        # self.http_app.add_websocket_route(self.ws_handler, '/ws')

        conn_conf = self.config.connection
        self.http_server = await self.http_app.create_server(
            conn_conf.host, conn_conf.port,
            return_asyncio_server=True,
        )

        self.ws_server = await websockets.serve(self.ws_handler, conn_conf.host, conn_conf.ws_port)

        await self.http_server.startup()

        self.backend_p.start()
        await asyncio.gather(
            self.http_server.serve_forever(),
            self.ws_server.serve_forever(),
            self.frontend.run_loop()
        )

    async def http_handler(self, request: Request, **__):

        path = unquote(request.path.replace('/', '\\'))
        if path.startswith('\\resources'):
            # cut off resources from uri to path
            dynamic_path = self.front_info.resources_folder + path[len('\\resources'):]
        else:
            dynamic_path = self.front_info.front_folder + path

        last_path = dynamic_path.split('\\')[-1]
        if '.' not in last_path:
            dynamic_path += ''

        if dynamic_path.endswith('.js'):
            mime_type = 'text/javascript'
        elif dynamic_path.endswith('.css'):
            mime_type = 'text/css'
        elif dynamic_path.endswith('.ico'):
            mime_type = 'image/x-icon'
        elif dynamic_path.endswith('.png'):
            mime_type = 'image/png'
        else:
            mime_type = 'text/plain'

        return await sanic.response.file(dynamic_path, mime_type=mime_type)

    async def ws_handler(self, websocket: websockets.server.WebSocketServerProtocol):
        # async def ws_handler(self, request, websocket):
        init_msg = await websocket.recv()
        init_msg_json = json.loads(init_msg)
        assert init_msg_json['type'] == MessageCode.Init

        session_info = SessionInfo.from_json(init_msg_json)
        user_session = await self.frontend.register_session(session_info, websocket)
        if user_session is not None:
            try:
                await user_session.listen()
            except Exception:
                raise
            finally:
                await self.frontend.unregister_session(user_session)
