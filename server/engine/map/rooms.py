import logging
import random
from pathlib import Path

import pytiled_parser
from tqdm import tqdm

from server.engine.map import Map


class Room:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.width = 0
        self.height = 0
        self.type = None


class RoomsManager:
    def __init__(self, map: Map):
        self.map = map

        self.rooms: list[Room] = []
        self.room_patterns: list[list[pytiled_parser.Layer]] = []
        self.logger = logging.getLogger('RoomsManager')

        self.init()

    def init(self):
        # load room patterns from files
        self.logger.info('Start loading room patterns from files')
        rooms_dir = Path('./resources/rooms')
        for room_file in tqdm(rooms_dir.iterdir()):
            room_tiled = pytiled_parser.parse_map(room_file)
            self.room_patterns.append(room_tiled.layers)
            self.map.update_tileset(room_tiled.tilesets)

    def generate_for_chunk(self, chunk_x: int, chunk_y: int):
        room_pattern: list[pytiled_parser.TileLayer] = random.choice(self.room_patterns)
        for layer in room_pattern:
            # find main layer
            if layer.properties.get('main', False):
                break
        else:
            raise Exception('Room without main layer')

        # TODO: add support rooms with several chunks
        tile_chunk = layer.chunks[0]
        self.map.chunks.add_chunk((chunk_x, chunk_y), tile_chunk)

