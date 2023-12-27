from .cell import Cell


class Chunk:
    def __init__(self, size: int):
        self.grid: list[list[Cell | None]] = [[None] * size for _ in range(size)]


class ChunksManager:
    def __init__(self, chunk_size: int):
        self.chunk_size = chunk_size
        self.chunks: dict[tuple[int, int], Chunk] = {}
