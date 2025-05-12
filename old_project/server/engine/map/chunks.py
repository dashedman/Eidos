import math

import pytiled_parser

from .cell import Cell
from ..physics import BoxCollider


PURE_CELL_MASK = (1 << 28) - 1
ROTATION_CELL_MASK = 15 << 28


class FindEmptyPlaceError(Exception):
    pass


class TileForCellNotFound(Exception):
    pass


class Chunk:
    def __init__(self, size: int):
        self.size = size
        self.grid: list[list[Cell | None]] = [[None] * size for _ in range(size)]

    def find_place_for(self, collider: BoxCollider, start_pos: tuple[int, int]):
        width_int = math.ceil(collider.width)
        height_int = math.ceil(collider.height)

        cell_x: int
        cell_y: int

        def check_empty_for_collider():
            for part_x in range(width_int + 1):
                for part_y in range(height_int + 1):
                    if self.grid[cell_x + part_x][cell_y + part_y] is not None:
                        return False
            return True

        for radius in range(0, self.size):
            # top line
            cell_y = radius + start_pos[1]
            if 0 <= cell_y < self.size:
                for cell_x in range(
                        max(0, start_pos[0] - radius),
                        min(self.size, start_pos[0] + radius + 1)
                ):
                    if check_empty_for_collider():
                        return cell_x, cell_y

            # left line. from up to down
            cell_x = radius - start_pos[0]
            if 0 <= cell_x < self.size:
                for cell_y in range(
                        min(self.size - 1, start_pos[1] + radius),
                        max(0, start_pos[1] - radius) - 1,
                        -1
                ):
                    if check_empty_for_collider():
                        return cell_x, cell_y

            # bottom line
            cell_y = radius - start_pos[1]
            if 0 <= cell_y < self.size:
                for cell_x in range(
                        max(0, start_pos[0] - radius),
                        min(self.size, start_pos[0] + radius + 1)
                ):
                    if check_empty_for_collider():
                        return cell_x, cell_y

            # right line. from up to down
            cell_x = radius + start_pos[0]
            if 0 <= cell_x < self.size:
                for cell_y in range(
                        min(self.size - 1, start_pos[1] + radius),
                        max(0, start_pos[1] - radius) - 1,
                        -1
                ):
                    if check_empty_for_collider():
                        return cell_x, cell_y
        raise FindEmptyPlaceError


class ChunksManager:
    def __init__(self, chunk_size: int):
        self.chunk_size = chunk_size
        self.chunks: dict[tuple[int, int], Chunk] = {}

    def get_chunk(self, chunk_coordinates: tuple[int, int]):
        return self.chunks.get(chunk_coordinates)

    def add_chunk(
            self,
            chunk_coordinates: tuple[int, int],
            tile_chunk: pytiled_parser.Chunk,
            tilesets: dict[int, pytiled_parser.Tileset],
    ):
        assert self.chunk_size == tile_chunk.size.width and self.chunk_size == tile_chunk.size.height
        chunk = Chunk(self.chunk_size)
        # fill chunk with cells
        for row_index, chunk_row in enumerate(tile_chunk.data):
            for column_index, raw_cell_id in enumerate(chunk_row):
                if raw_cell_id == 0:
                    continue

                # invert index cause tiled chunk oriented from up to bottom
                # but our chunk oriented from bottom to up
                inv_row_index = self.chunk_size - row_index - 1

                cell_coordinates = (
                    chunk_coordinates[0] * self.chunk_size + column_index,
                    chunk_coordinates[1] * self.chunk_size + inv_row_index,
                )

                pure_cell_id = raw_cell_id & PURE_CELL_MASK
                rotate_bits = (raw_cell_id & ROTATION_CELL_MASK) >> 29

                # find tile by pure_cell_id
                for tileset in tilesets.values():
                    for tile in tileset.tiles.values():
                        global_tile_id = tileset.firstgid + tile.id
                        if pure_cell_id == global_tile_id:
                            cell_id = f'{tileset.name}_{pure_cell_id}'
                            break
                    else:
                        continue
                    break
                else:
                    raise TileForCellNotFound

                chunk.grid[column_index][inv_row_index] = Cell(cell_id, cell_coordinates, rotate_bits)

        # add to chunks map
        self.chunks[chunk_coordinates] = chunk
