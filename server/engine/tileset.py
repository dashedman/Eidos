from functools import cached_property
from pathlib import Path

import pytiled_parser


class TileSet:
    def __init__(
            self,
            tileset: pytiled_parser.Tileset,
            tileset_path: Path | None = None,
            ignore_class_none: bool = False,
    ):
        self.tiles = []
        self.tileset_path = tileset_path
        self.first_gid = tileset.firstgid
        self.name = tileset.name
        self.gid_key = f'{self.name}_{self.first_gid}'
        self.image = tileset.image
        self.tile_width = tileset.tile_width
        self.tile_height = tileset.tile_height
        self.tile_count = tileset.tile_count
        self.columns = tileset.columns

        for tile in tileset.tiles.values():
            if ignore_class_none and tile.class_ is None:
                continue
            self.tiles.append(tile)

    @cached_property
    def tileset_data(self):
        return {
            'first_gid': self.first_gid,
            'gid_key': self.gid_key,
            'name': self.name,
            # create file uri from path
            'image': str(self.tileset_path.joinpath(self.image).as_posix()).removeprefix('..'),
            'tile_width': self.tile_width,
            'tile_height': self.tile_height,
            'tile_count': self.tile_count,
            'columns': self.columns,
            'tiles': [
                {
                    'id': tile.id,
                    'type': tile.class_,
                    'animation': tile.animation,
                }
                for tile in self.tiles
            ]
        }


class TileSetRegistry:
    def __init__(self):
        self.tileset_registry: dict[str, TileSet] = {}

    @cached_property
    def registry_data(self):
        return {
            gid: tileset.tileset_data
            for gid, tileset in self.tileset_registry.items()
        }

    def update_one(
            self,
            tileset: pytiled_parser.Tileset,
            tileset_path: Path = None,
            ignore_class_none: bool = False,
    ):
        self.update({-1: tileset}, tileset_path, ignore_class_none)

    def update(
            self,
            tilesets: dict[int, pytiled_parser.Tileset],
            tileset_path: Path = None,
            ignore_class_none: bool = False,
    ):
        for tileset in tilesets.values():
            gid_key = f'{tileset.name}_{tileset.firstgid}'
            self.tileset_registry[gid_key] = TileSet(tileset, tileset_path, ignore_class_none)

        if 'registry_data' in self.__dict__.keys():
            # noinspection PyPropertyAccess
            del self.registry_data
