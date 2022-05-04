import asyncio
import logging
import os
from dataclasses import dataclass
from urllib.parse import unquote

import sanic
import sanic.response
import sanic.server
from sanic.request import Request

from .config import ServerConfig


@dataclass
class FrontendInfo:
    folder: str
    index: str
    resources: str
    js: str
    css: str


class Server:
    loop: asyncio.AbstractEventLoop
    app: sanic.Sanic
    app_server: sanic.server.AsyncioServer

    def __init__(self, config: ServerConfig):
        self.logger = logging.getLogger('main')
        self.logger.setLevel(logging.INFO)
        self.config = config

        self.logger.info('Path to frontend part: %s', self.config.path_to_front)
        self.front_info = FrontendInfo(
            self.config.path_to_front,
            os.path.join(self.config.path_to_front, 'index.html'),
            os.path.join(self.config.path_to_front, 'resources'),
            os.path.join(self.config.path_to_front, 'js'),
            os.path.join(self.config.path_to_front, 'css'),
        )
        self.app = sanic.Sanic("GameServerApp")

    async def run(self):
        self.loop = asyncio.get_running_loop()
        # add handler to route
        self.app.static("/", self.front_info.index)

        def add_routers(handler, suffix, depth=1):
            uri = suffix
            for i in range(depth):
                uri += f'/<path{i}>'
                self.app.add_route(handler, uri)

        add_routers(self.http_handler, '/js', 10)
        add_routers(self.http_handler, '/css', 3)
        add_routers(self.http_handler, '/resources', 3)
        add_routers(self.http_handler, '/shaders', 3)

        self.app_server = await self.app.create_server('127.0.0.1', 8000, return_asyncio_server=True)
        await self.app_server.startup()
        await self.app_server.serve_forever()

    async def http_handler(self, request: Request, **pathes):
        dynamic_path = self.front_info.folder + unquote(request.path.replace('/', '\\'))
        return await sanic.response.file( dynamic_path )
