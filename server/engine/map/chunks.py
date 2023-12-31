import pytiled_parser

from .cell import Cell


class Chunk:
    def __init__(self, size: int):
        self.grid: list[list[Cell | None]] = [[None] * size for _ in range(size)]


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
    ):
        assert self.chunk_size == tile_chunk.size
        chunk = Chunk(self.chunk_size)
        # fill chunk with cells
        for row_index, chunk_row in enumerate(tile_chunk.data):
            for column_index, raw_cell in enumerate(chunk_row):
                cell_coordinates = (
                    chunk_coordinates[0] * self.chunk_size + column_index,
                    chunk_coordinates[1] * self.chunk_size + row_index,
                )
                chunk.grid[column_index][row_index] = Cell(raw_cell, cell_coordinates)

        # add to chunks map
        self.chunks[chunk_coordinates] = chunk
