import json
import logging
from dataclasses import dataclass

import websockets.server
import websockets.connection
from websockets.exceptions import ConnectionClosedOK

from .inputs import InputRegistry, InputAction, InputType
from .session import SessionInfo


@dataclass
class UserCoords:
    x: float
    y: float
    chunkX: int
    chunkY: int
    location: str


class User:

    def __init__(
            self,
            name: str,
            session: SessionInfo,
            websocket: websockets.server.WebSocketServerProtocol
    ):
        self.session = session
        self.name = name
        self.websocket = websocket
        self.logger = logging.getLogger(f'user_{name}')

        self.input_registry = InputRegistry()
        self.coords = UserCoords(0, 0, 0, 0, 'spawn')

    async def listen(self):
        self.logger.info('Start listen user')
        async for request_json in self.websocket:
            request = json.loads(request_json)

            input_type = InputType(request.get('input_type'))
            input_action = InputAction(request.get('input_action'))
            self.input_registry.register_input(input_action, input_type)

    async def send(self, data: str):
        await self.websocket.send(data)

