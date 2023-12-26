import asyncio
import json
import logging
import os
from dataclasses import dataclass
from urllib.parse import unquote

import websockets
import websockets.server

import sanic
import sanic.response
import sanic.server
from sanic.request import Request

from . import logger
from .game_app import GameApplication
from .config import ServerConfig
from .exceptions import BadWebsocketRequest
from .session import SessionInfo


@dataclass
class FrontendInfo:
    folder: str
    index: str
    favicon: str
    resources: str
    js: str
    css: str


class Server:
    loop: asyncio.AbstractEventLoop

    app: GameApplication
    http_app: sanic.Sanic
    http_server: sanic.server.AsyncioServer
    ws_server: websockets.server.WebSocketServer

    def __init__(self, config: ServerConfig):
        self.logger = logger.get_logger(config.logger)
        self.logger.setLevel(logging.INFO)
        self.config = config

        self.logger.info('Path to frontend part: %s', self.config.path_to_front)
        self.front_info = FrontendInfo(
            self.config.path_to_front,
            os.path.join(self.config.path_to_front, 'index.html'),
            os.path.join(self.config.path_to_front, 'favicon.ico'),
            os.path.join(self.config.path_to_front, 'resources'),
            os.path.join(self.config.path_to_front, 'js'),
            os.path.join(self.config.path_to_front, 'css'),
        )

        self.http_app = sanic.Sanic("GameServerApp")
        self.app = GameApplication(self.config.game)

    async def run(self):
        self.loop = asyncio.get_running_loop()
        # add handler to route
        self.http_app.static("/", self.front_info.index)
        self.http_app.static("/favicon.ico", self.front_info.favicon)

        def add_routers(handler, suffix, depth=1):
            uri = suffix
            for i in range(depth):
                uri += f'/<path{i}>'
                self.http_app.add_route(handler, uri)

        add_routers(self.http_handler, '/js', 10)
        add_routers(self.http_handler, '/css', 3)
        add_routers(self.http_handler, '/resources', 6)
        add_routers(self.http_handler, '/shaders', 3)

        # self.http_app.add_websocket_route(self.ws_handler, '/ws')

        conn_conf = self.config.connection
        self.http_server = await self.http_app.create_server(
            conn_conf.host, conn_conf.port,
            return_asyncio_server=True,
        )

        self.ws_server = await websockets.serve(self.ws_handler, conn_conf.host, conn_conf.ws_port)

        await self.http_server.startup()

        await asyncio.gather(
            self.http_server.serve_forever(),
            self.ws_server.serve_forever(),
            self.app.main_loop()
        )

    async def http_handler(self, request: Request, **__):
        dynamic_path = self.front_info.folder + unquote(request.path.replace('/', '\\'))
        last_path = dynamic_path.split('\\')[-1]
        if '.' not in last_path:
            dynamic_path += '.js'

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
        first_msg_json = await websocket.recv()
        session_info = SessionInfo.from_json(json.loads(first_msg_json))
        user = await self.app.register_session(session_info, websocket)
        await user.listen()
