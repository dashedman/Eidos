import json
import logging
from dataclasses import dataclass

import websockets.connection

from .inputs import InputRegistry, InputAction, InputType
from .session import SessionInfo
from .utils.shared_types import SharedFloat


@dataclass(kw_only=True)
class UserPositionKeys:
    x: str
    y: str
    vx: str
    vy: str

    def to_user_position(self):
        return UserPosition(
            x=SharedFloat.from_name(name=self.x),
            y=SharedFloat.from_name(name=self.y),
            vx=SharedFloat.from_name(name=self.vx),
            vy=SharedFloat.from_name(name=self.vy),
        )


@dataclass(kw_only=True)
class UserPosition:
    x: SharedFloat
    y: SharedFloat
    vx: SharedFloat
    vy: SharedFloat

    def to_user_position_keys(self):
        return UserPositionKeys(
            x=self.x.name,
            y=self.x.name,
            vx=self.x.name,
            vy=self.x.name,
        )

    def close(self):
        self.x.close()
        self.y.close()
        self.vx.close()
        self.vy.close()

class UserSession:
    position: UserPosition

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

    async def listen(self):
        self.logger.info('Start listen user')
        async for request_json in self.websocket:
            request = json.loads(request_json)

            try:
                input_type = InputType(request['input_type'])
                input_action = InputAction(request['input_action'])
            except KeyError:
                print(request)
                raise
            self.input_registry.register_input(input_action, input_type)

    async def send(self, data: str):
        await self.websocket.send(data)

