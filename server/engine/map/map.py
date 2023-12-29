import easy_vector

from .chunks import ChunksManager
from .rooms import RoomsManager
from ..entities import User


class Map:
    CHUNK_SIZE = 16

    def __init__(self):
        self.chunks = ChunksManager(self.CHUNK_SIZE)
        self.rooms = RoomsManager()
        self.last_user_positions: dict[int, tuple[int, int]] = {}

    def check_new_parts_for_user(self, user: User):
        user_collider = user.ph_collider
        if user_collider.vx != 0 or user_collider.vy != 0:
            user_dir = easy_vector.Vector(user_collider.vx, user_collider.vy).normal
            user_x, user_y = int(user_collider.x), int(user_collider.y)
            distance_vector = user_dir * user.sight_distance
            sight_r_quad = user.sight_distance * user.sight_distance

            # start x and y
            curr_x, curr_y = -int(distance_vector.y) + user_x, int(distance_vector.x) + user_y
            end_x, end_y = -start_x, -start_y

            # Bresenham’s circle drawing algorithm
            while curr_x != end_x and curr_y != end_y:
                x_dist = user_x - curr_x
                y_dist = user_y - curr_y
                distance_to_user_quad = x_dist * x_dist + y_dist * y_dist
                if distance_to_user_quad < sight_r_quad:
                    
