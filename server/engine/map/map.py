from .chunks import ChunksManager
from .rooms import RoomsManager


class Map:
    def __init__(self):
        self.chunks = ChunksManager()
        self.rooms = RoomsManager()
