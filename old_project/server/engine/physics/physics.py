import math

from .colliders import InertiaBoxCollider, BoxCollider
from .. import game_app
from ..utils.geometry import point_line_orientation


class PhysicsEngine:
    G_FORCE = 30

    def __init__(self, backend: 'game_app.GameBackend', debug_mode: bool = False):
        self.backend = backend
        self.debug_mode = debug_mode

    def tick(self, time_delta: float):
        chunks = self.backend.map.chunks.chunks
        chunk_size = self.backend.map.chunks.chunk_size
        
        for collider in self.backend.users.colliders():
            self.processing_velocity(collider, time_delta)

            if collider.vx == 0 and collider.vy == 0:
                continue

            dir_x = 1 if collider.vx >= 0 else -1
            dir_y = 1 if collider.vy >= 0 else -1

            # check grid
            # chunk coords

            start_chunk_x = math.floor(collider.left / chunk_size)
            end_chunk_x = math.floor(collider.right / chunk_size)
            start_chunk_y = math.floor(collider.bottom / chunk_size)
            end_chunk_y = math.floor(collider.top / chunk_size)

            if dir_x < 0:
                start_chunk_x, end_chunk_x = end_chunk_x, start_chunk_x + dir_x
            else:
                end_chunk_x += dir_x

            if dir_y < 0:
                start_chunk_y, end_chunk_y = end_chunk_y, start_chunk_y + dir_y
            else:
                end_chunk_y += dir_y

            for chunk_x in range(start_chunk_x, end_chunk_x + dir_x, dir_x):
                for chunk_y in range(start_chunk_y, end_chunk_y + dir_y, dir_y):
                    chunk = chunks.get((chunk_x, chunk_y))
                    if chunk is None:
                        continue

                    start_cell_x = max(math.floor(collider.left - (chunk_x * chunk_size)), 0)
                    end_cell_x = min(math.floor(collider.right - (chunk_x * chunk_size)), chunk_size - 1)
                    start_cell_y = max(math.floor(collider.bottom - (chunk_y * chunk_size)), 0)
                    end_cell_y = min(math.floor(collider.top - (chunk_y * chunk_size)), chunk_size - 1)

                    if dir_x < 0:
                        start_cell_x, end_cell_x = end_cell_x, start_cell_x + dir_x
                    else:
                        end_cell_x += dir_x

                    if dir_y < 0:
                        start_cell_y, end_cell_y = end_cell_y, start_cell_y + dir_y
                    else:
                        end_cell_y += dir_y

                    for cell_x in range(start_cell_x, end_cell_x + dir_x, dir_x):
                        for cell_y in range(start_cell_y, end_cell_y + dir_y, dir_y):
                            cell = chunk.grid[cell_x][cell_y]
                            if cell is None:
                                continue

                            self.processing_with_ceil(collider, cell.ph_collider)

    def processing_velocity(self, collider: InertiaBoxCollider, time_delta: float):
        collider.set_vx(collider.vx + collider.ax * time_delta)
        collider.set_vy(collider.vy + (collider.ay - self.G_FORCE) * time_delta)
        collider.set_x(collider.x + collider.vx * time_delta)
        collider.set_y(collider.y + collider.vy * time_delta)

    @staticmethod
    def processing_with_ceil(collider: InertiaBoxCollider, cell_box: BoxCollider):
        # coordinates of velocity vector
        # corner coords of ceil
        nearest_corner_x = nearest_corner_y = None
        
        if collider.vx > 0:
            nearest_corner_x = cell_box.left
            if collider.vy > 0:
                nearest_corner_y = cell_box.bottom
                angle_orientation = point_line_orientation(
                    collider.right, collider.top,
                    collider.vx, collider.vy,
                    nearest_corner_x, nearest_corner_y
                )
                if angle_orientation > 0:
                    # collision with left edge
                    collider.set_x(nearest_corner_x - collider.half_width)
                    collider.set_vx(0)
                else:
                    # collision with bottom edge
                    collider.set_y(nearest_corner_y - collider.half_height)
                    collider.set_vy(0)

            elif collider.vy < 0:
                nearest_corner_y = cell_box.top
                angle_orientation = point_line_orientation(
                    collider.right, collider.bottom,
                    collider.vx, collider.vy,
                    nearest_corner_x, nearest_corner_y
                )
                if angle_orientation > 0:
                    # collision with top edge
                    collider.set_y(nearest_corner_y + collider.half_height)
                    collider.set_vy(0)
                else:
                    # collision with left edge
                    collider.set_x(nearest_corner_x - collider.half_width)
                    collider.set_vx(0)

            else:
                non_soft_y_collision = (
                        cell_box.bottom < collider.top <= cell_box.top
                        or cell_box.bottom <= collider.bottom < cell_box.top
                )
                if non_soft_y_collision and cell_box.left < collider.right:
                    # horisontal right move
                    # only less! not equal
                    collider.set_x(cell_box.left - collider.half_width)
                    collider.set_vx(0)
        elif collider.vx < 0:
            nearest_corner_x = cell_box.right
            if collider.vy > 0:
                nearest_corner_y = cell_box.bottom
                angle_orientation = point_line_orientation(
                    collider.left, collider.top,
                    collider.vx, collider.vy,
                    nearest_corner_x, nearest_corner_y
                )
                if angle_orientation > 0:
                    # collision with bottom edge
                    collider.set_y(nearest_corner_y - collider.half_height)
                    collider.set_vy(0)
                else:
                    # collision with right edge
                    collider.set_x(nearest_corner_x + collider.half_width)
                    collider.set_vx(0)

            elif collider.vy < 0:
                nearest_corner_y = cell_box.top
                angle_orientation = point_line_orientation(
                    collider.left, collider.bottom,
                    collider.vx, collider.vy,
                    nearest_corner_x, nearest_corner_y
                )
                if angle_orientation > 0:
                    # collision with right edge
                    collider.set_x(nearest_corner_x + collider.half_width)
                    collider.set_vx(0)
                else:
                    # collision with top edge
                    collider.set_y(nearest_corner_y + collider.half_height)
                    collider.set_vy(0)
            else:
                non_soft_y_collision = (
                        cell_box.bottom < collider.top <= cell_box.top
                        or cell_box.bottom <= collider.bottom < cell_box.top
                )
                if non_soft_y_collision and cell_box.right > collider.left:
                    # horisontal left move
                    # only greater! not equal
                    collider.set_x(cell_box.right + collider.half_width)
                    collider.set_vx(0)

        else:
            # vertical move
            # check non soft collision for x
            non_soft_x_collision = (
                    cell_box.left < collider.right <= cell_box.right
                    or cell_box.left <= collider.left < cell_box.right
            )
            if non_soft_x_collision:
                if collider.vy > 0 and cell_box.bottom < collider.top:
                    # horisontal up move
                    # only less! not equal
                    collider.set_y(cell_box.bottom - collider.half_height)
                    collider.set_vy(0)
                elif collider.vy < 0 and cell_box.top > collider.bottom:
                    # horisontal down move
                    # only greater! not equal
                    collider.set_y(cell_box.top + collider.half_height)
                    collider.set_vy(0)
