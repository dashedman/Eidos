import json
import logging
from dataclasses import dataclass

import websockets.server
import websockets.connection
from websockets.exceptions import ConnectionClosedOK

from .session import SessionInfo


@dataclass
class UserCoords:
    x: float
    y: float
    chunkX: int
    chunkY: int
    location: str


class User:
    websocket: websockets.server.WebSocketServerProtocol

    def __init__(self, session: SessionInfo, name: str, websocket):
        self.session = session
        self.name = name
        self.websocket = websocket
        self.logger = logging.getLogger('user')

        self.coords = UserCoords(0, 0, 0, 0, 'spawn')

    async def listen(self):
        self.logger.info('Start listen user')
        while True:
            try:
                request_json = await self.websocket.recv()
            except ConnectionClosedOK:
                break

            request = json.loads(request_json)
            case_key = request.get('case')
            if case_key == 'position':
                data = request.get('data')
                self.coords.x = data['x']
                self.coords.y = data['y']

    async def send(self, data: str):
        await self.websocket.send(data)

