import logging
import random
from pathlib import Path

import pytiled_parser
from tqdm import tqdm

from .map import Map


class Room:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.width = 0
        self.height = 0
        self.type = None


class RoomsManager:
    def __init__(self, map_: Map):
        self.map = map_

        self.rooms: list[Room] = []
        self.room_patterns: list[pytiled_parser.TiledMap] = []
        self.logger = logging.getLogger('RoomsManager')

        self.init()

    def init(self):
        # load room patterns from files
        self.logger.info('Start loading room patterns from files')
        rooms_dir = Path('../resources/rooms')
        for room_file in tqdm(rooms_dir.glob('**/*.json')):
            room_tiled = pytiled_parser.parse_map(room_file)
            self.room_patterns.append(room_tiled)
            self.map.update_tileset(room_tiled.tilesets, room_file.parent)

    def generate_for_chunk(self, chunk_x: int, chunk_y: int):
        room_pattern: pytiled_parser.TiledMap = random.choice(self.room_patterns)
        for layer in room_pattern.layers:
            # find main layer
            if layer.properties.get('main', False):
                break
        else:
            raise Exception('Room without main layer')

        layer: pytiled_parser.TileLayer
        # TODO: add support rooms with several chunks
        tile_chunk = layer.chunks[0]
        self.map.chunks.add_chunk((chunk_x, chunk_y), tile_chunk, room_pattern.tilesets)

    @staticmethod
    def print_pattern(room_pattern: list[pytiled_parser.TileLayer]):
        for layer in room_pattern:
            # find main layer
            if layer.properties.get('main', False):
                break
        else:
            raise Exception('Room without main layer')

        # TODO: add support rooms with several chunks
        tile_chunk = layer.chunks[0]
        for row in tile_chunk.data:
            row_str = ''.join([' ' if c == 0 else '#' for c in row])
            print(row_str)


