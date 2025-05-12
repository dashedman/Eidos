from old_project.server.engine.physics import BoxCollider


class Cell:
    def __init__(self, tile_id: str, coordinates: tuple[int, int], rotate_bits: int = 0):
        self.type = None
        self.tile_id = tile_id
        self.rotate_bits = rotate_bits
        self.ph_collider = BoxCollider(
            x=coordinates[0],
            y=coordinates[1],
            width=1,
            height=1,
        )
