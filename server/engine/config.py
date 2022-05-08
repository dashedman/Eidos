from dataclasses import dataclass


@dataclass
class ConnectionConfig:
    host: str
    port: int
    ws_port: int

    @staticmethod
    def from_dict(source: dict) -> 'ConnectionConfig':
        return ConnectionConfig(
            source['host'],
            int(source['port']),
            int(source['ws_port'])
        )


@dataclass
class LoggingHandlerConfig:
    level: int
    level_upper_bound: int = None
    file_name: str = None
    rotation_day_interval: int = None
    rotation_size: int = None
    backupCount: int = None

    @staticmethod
    def from_dict(source: dict[str, str]):
        return LoggingHandlerConfig(
            int(source['level']),
            int(source.get('level_upper_bound', 0)) or None,
            source.get('file_name'),
            int(source.get('rotation_day_interval', 0)) or None,
            int(source.get('rotation_size', 0)) or None,
            int(source.get('backupCount', 0)) or None,
        )


@dataclass
class LoggingConfig:
    name: str
    level: int
    dir: str
    handlers: list[LoggingHandlerConfig]

    @staticmethod
    def from_dict(source):
        return LoggingConfig(
            source['name'],
            int(source['level']),
            source['dir'],
            [LoggingHandlerConfig.from_dict(h_source) for h_source in source['handlers']],
        )


@dataclass
class GameConfig:
    name: str
    version: str

    @staticmethod
    def from_dict(source):
        return GameConfig(
            source['name'],
            source['version'],
        )


@dataclass
class ServerConfig:
    path_to_front: str
    connection: ConnectionConfig
    logger: LoggingConfig
    game: GameConfig

    @staticmethod
    def from_dict(source: dict) -> 'ServerConfig':
        return ServerConfig(
            source['path_to_front'],
            ConnectionConfig.from_dict(source['connection']),
            LoggingConfig.from_dict(source['logger']),
            GameConfig.from_dict(source['game'])
        )
