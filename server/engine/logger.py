import datetime
import logging
import logging.handlers as log_handlers
import os

from .config import LoggingConfig


class LevelUpperBoundFilter(logging.Filter):
    level = logging.NOTSET

    def setLevel(self, level):
        self.level = level

    def filter(self, record):
        return record.levelno <= self.level


def get_logger(logger_config: LoggingConfig) -> logging.Logger:
    logging.basicConfig(
        format='%(asctime)s %(levelname)7s [%(name)s]: %(message)s'
    )
    _logger = logging.getLogger(logger_config.name)
    _logger.setLevel(logger_config.level)

    for handler_config in logger_config.handlers:
        if handler_config.file_name:
            log_file_name = f'{handler_config.file_name}.log'
            log_file = os.path.join(logger_config.dir, log_file_name)

            if handler_config.rotation_day_interval:
                handler = log_handlers.TimedRotatingFileHandler(
                    log_file, 'D',
                    interval=handler_config.rotation_day_interval,
                    backupCount=handler_config.backupCount,
                    utc=True,
                )
            else:
                handler = log_handlers.RotatingFileHandler(
                    log_file, 'a',
                    maxBytes=handler_config.rotation_size,
                    backupCount=handler_config.backupCount
                )

            if handler_config.level_upper_bound is not None:
                one_level_filter = LevelUpperBoundFilter('level_upper_bound')
                one_level_filter.setLevel(handler_config.level)
                handler.addFilter(one_level_filter)

            handler.setLevel(handler_config.level)
        _logger.addHandler(handler)
    return _logger
