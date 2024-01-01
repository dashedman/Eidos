from functools import cached_property

import pytiled_parser


class TileSet:
    def __init__(self, tileset: pytiled_parser.Tileset):
        self.tiles = []
        self.image = tileset.image
        self.tile_width = tileset.tile_width
        self.tile_height = tileset.tile_height

        for tile in tileset.tiles.values():
            if tile.class_ is None:
                continue
            self.tiles.append(tile)

    @cached_property
    def tileset_data(self):
        return {
            'image': self.image,
            'tile_width': self.tile_width,
            'tile_height': self.tile_height,
            'tiles': [
                {
                    'íd': tile.id,
                    'type': tile.class_,
                    'animation': tile.animation,
                }
                for tile in self.tiles
            ]
        }


class TileSetRegistry:
    def __init__(self):
        self.tileset_registry: dict[int, TileSet] = {}

    @cached_property
    def registry_data(self):
        return {
            gid: tileset.tileset_data
            for gid, tileset in self.tileset_registry.items()
        }

    def update(self, tilesets: dict[int, pytiled_parser.Tileset]):
        for tileset in tilesets.values():
            self.tileset_registry[tileset.firstgid] = TileSet(tileset)

        if 'registry_data' in self.__dict__.keys():
            # noinspection PyPropertyAccess
            del self.registry_data
