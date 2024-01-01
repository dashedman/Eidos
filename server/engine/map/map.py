from typing import Literal

from pytiled_parser import Tileset

from . import Cell
from .chunks import ChunksManager
from .rooms import RoomsManager
from ..entities import User
from ..game_app import GameBackend

DIRECTION_TO_OCTANT = {
    1: {(-1, 1), (0, 1), (1, 1), (1, 0)},
    2: {(0, 1), (1, 1), (1, 0), (1, -1)},
    3: {(1, 1), (1, 0), (1, -1), (0, -1)},
    4: {(1, 0), (1, -1), (0, -1), (-1, -1)},
    5: {(1, -1), (0, -1), (-1, -1), (-1, 0)},
    6: {(0, -1), (-1, -1), (-1, 0), (-1, 1)},
    7: {(-1, -1), (-1, 0), (-1, 1), (0, 1)},
    8: {(-1, 0), (-1, 1), (0, 1), (1, 1)},
}


class Map:
    CHUNK_SIZE = 16

    def __init__(self, backend: GameBackend):
        self.backend = backend

        self.chunks = ChunksManager(self.CHUNK_SIZE)
        self.rooms = RoomsManager(self)
        self.last_user_positions: dict[User, tuple[int, int]] = {}

    def check_user_map(self, user) -> list[Cell] | None:
        last_user_pos = self.last_user_positions.get(user)
        user_x, user_y = int(user.ph_collider.x), int(user.ph_collider.y)
        if last_user_pos is None:
            # new user
            # set big diff to generate full circle
            x_diff = 100000
            y_diff = 100000
        else:
            x_diff: Literal[-1, 0, 1] | int = user_x - last_user_pos[0]
            y_diff: Literal[-1, 0, 1] | int = user_y - last_user_pos[1]
            if x_diff == 0 and y_diff == 0:
                # no moves
                return

        self.last_user_positions[user] = (user_x, user_y)
        if abs(x_diff) < 2 and abs(y_diff) < 2:
            x_diff: Literal[-1, 0, 1]
            y_diff: Literal[-1, 0, 1]
            return self.get_new_parts_for_user(user, x_diff, y_diff)
        else:
            return self.get_full_circle_for_user(user)

    def get_new_parts_for_user(
            self,
            user: User,
            dir_x: Literal[-1, 0, 1],
            dir_y: Literal[-1, 0, 1],
    ) -> list[Cell]:
        cell_for_user: set[Cell | None] = {None}

        user_collider = user.ph_collider
        user_x, user_y = round(user_collider.x), round(user_collider.y)

        # Michener’s circle drawing algorithm
        curr_x = 0
        curr_y = round(user.sight_distance)
        delta = 3 - 2 * user.sight_distance
        u_dir = (dir_x, dir_y)
        while curr_x <= curr_y:
            if u_dir in DIRECTION_TO_OCTANT[1]:
                cell_for_user.add(self.get_cell(user_x + curr_x, user_y + curr_y))
            if u_dir in DIRECTION_TO_OCTANT[4]:
                cell_for_user.add(self.get_cell(user_x + curr_x, user_y - curr_y))
            if u_dir in DIRECTION_TO_OCTANT[8]:
                cell_for_user.add(self.get_cell(user_x - curr_x, user_y + curr_y))
            if u_dir in DIRECTION_TO_OCTANT[5]:
                cell_for_user.add(self.get_cell(user_x - curr_x, user_y - curr_y))

            if u_dir in DIRECTION_TO_OCTANT[2]:
                cell_for_user.add(self.get_cell(user_x + curr_y, user_y + curr_x))
            if u_dir in DIRECTION_TO_OCTANT[7]:
                cell_for_user.add(self.get_cell(user_x + curr_y, user_y - curr_x))
            if u_dir in DIRECTION_TO_OCTANT[3]:
                cell_for_user.add(self.get_cell(user_x - curr_y, user_y + curr_x))
            if u_dir in DIRECTION_TO_OCTANT[6]:
                cell_for_user.add(self.get_cell(user_x - curr_y, user_y - curr_x))

            if delta <= 0:
                delta += 4 * curr_x + 6
                curr_x += 1
                continue
            delta += 4 * (curr_x - curr_y) + 10
            curr_x += 1
            curr_y -= 1

        cell_for_user.remove(None)
        return list(cell_for_user)

    def get_full_circle_for_user(self, user: User) -> list[Cell]:
        cell_for_user: set[Cell | None] = {None}

        user_collider = user.ph_collider
        user_x, user_y = round(user_collider.x), round(user_collider.y)

        # Michener’s circle drawing algorithm
        curr_x = 0
        curr_y = round(user.sight_distance)
        delta = 3 - 2 * user.sight_distance
        while curr_x <= curr_y:
            # draw line from y=x to circle's edge
            support_y = curr_x
            while support_y <= curr_y:
                cell_for_user.update((
                    self.get_cell(user_x + curr_x, user_y + support_y), # get main cell
                    self.get_cell(user_x + curr_x, user_y - support_y), # get cell from point symetry second quarter
                    self.get_cell(user_x - curr_x, user_y + support_y), # get cell from point symetry third quarter
                    self.get_cell(user_x - curr_x, user_y - support_y), # get cell from point symetry fourth quarter

                    self.get_cell(user_x + support_y, user_y + curr_x), # get cell from x=y symetry
                    self.get_cell(user_x + support_y, user_y - curr_x), # get cell from x=y symetry second quarter
                    self.get_cell(user_x - support_y, user_y + curr_x), # get cell from x=y symetry third quarter
                    self.get_cell(user_x - support_y, user_y - curr_x), # get cell from x=y symetry fourth quarter
                ))
                support_y += 1

            if delta <= 0:
                delta += 4 * curr_x + 6
                curr_x += 1
                continue
            delta += 4 * (curr_x - curr_y) + 10
            curr_x += 1
            curr_y -= 1

        cell_for_user.remove(None)
        return list(cell_for_user)

    def get_cell(self, cell_x: int, cell_y: int) -> Cell | None:
        chunk_x = cell_x // self.CHUNK_SIZE
        chunk_y = cell_y // self.CHUNK_SIZE
        cell_x_in_chunk = cell_x % self.CHUNK_SIZE
        cell_y_in_chunk = cell_y % self.CHUNK_SIZE
        chunk = self.chunks.get_chunk((chunk_x, chunk_y))
        if chunk is None:
            # generate new room and chunk
            self.rooms.generate_for_chunk(chunk_x, chunk_y)
            chunk = self.chunks.get_chunk((chunk_x, chunk_y))

        cell = chunk.grid[cell_x_in_chunk][cell_y_in_chunk]
        return cell

    def update_tileset(self, tilesets: dict[int, Tileset]):
        self.backend.update_tileset(tilesets)
