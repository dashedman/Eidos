from dataclasses import dataclass


@dataclass
class ConnectionConfig:
    host: str
    port: int

    @staticmethod
    def from_dict(source: dict) -> 'ConnectionConfig':
        return ConnectionConfig(
            source['host'],
            int(source['port'])
        )


@dataclass
class LoggingHandlerConfig:
    level: int
    level_upper_bound: int = None
    file_name: str = None
    rotation_day_interval: int = None
    rotation_size: int = None
    backupCount: int = None


@dataclass
class LoggingConfig:
    name: str
    level: int
    dir: str
    handlers: list[LoggingHandlerConfig]


@dataclass
class ServerConfig:
    path_to_front: str
    connection: ConnectionConfig
    logging: LoggingConfig

    @staticmethod
    def from_dict(source: dict) -> 'ServerConfig':
        return ServerConfig(
            source['path_to_front'],
            ConnectionConfig.from_dict(source['connection']),
            LoggingConfig()
        )
