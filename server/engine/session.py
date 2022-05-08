from dataclasses import dataclass

from .exceptions import BadWebsocketRequest


@dataclass
class SessionInfo:
    id: int
    version: str

    @staticmethod
    def from_json(data_json: dict):
        try:
            session_json: dict = data_json.get('session')

            id = int(session_json.get('id', 0))
            version = session_json['version']
        except (KeyError, ValueError):
            raise BadWebsocketRequest('Bad session description')
        return SessionInfo(id, version)
