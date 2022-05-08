import asyncio
import json
import random

import websockets
from websockets.server import WebSocketServerProtocol

from .config import GameConfig
from .session import SessionInfo
from .user import User


class GameApplication:
    def __init__(self, config: GameConfig):
        self.config = config
        self.user_sessions: dict[WebSocketServerProtocol, User] = {}

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
        new_user = User(session_info, '', websocket)
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

    async def serve(self):
        while True:
            await asyncio.sleep(0.1)

            users_to_del = []
            for key, user in self.user_sessions.items():
                if user.websocket.connection.state == websockets.server.State.CLOSED:
                    users_to_del.append(key)

            if users_to_del:
                for key in users_to_del:
                    del self.user_sessions[key]
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
                us.send(data) for us in self.user_sessions.values()
            ))


