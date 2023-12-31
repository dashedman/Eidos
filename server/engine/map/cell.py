from server.engine.physics import BoxCollider


class Cell:
    def __init__(self, tile_id: int, coordinates: tuple[int, int]):
        self.type = None
        self.tile_id = tile_id
        self.ph_collider = BoxCollider(
            x=coordinates[0],
            y=coordinates[1],
            width=1,
            height=1,
        )
