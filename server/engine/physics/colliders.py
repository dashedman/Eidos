from abc import ABC


class AbstractCollider(ABC):
    pass


class BoxCollider(AbstractCollider):
    __slots__ = ('x', 'y', 'width', 'half_width', 'height', 'half_height')

    def __init__(self, x: float, y: float, width: float, height: float):
        self.x = x
        self.y = y
        self.width = 0
        self.half_width = 0
        self.height = 0
        self.half_height = 0

        self.set_width(width)
        self.set_height(height)

    def set_width(self, width: float):
        self.width = width
        self.half_width = width * 0.5

    def set_height(self, height: float):
        self.height = height
        self.half_height = height * 0.5

    @property
    def left(self):
        return self.x - self.half_width

    @property
    def right(self):
        return self.x + self.half_width

    @property
    def top(self):
        return self.y + self.half_height

    @property
    def bottom(self):
        return self.y - self.half_height


class InertiaBoxCollider(BoxCollider):
    __slots__ = ('vx', 'vy', 'ax', 'ay')

    def __init__(self, x: float, y: float, width: float, height: float):
        super().__init__(x, y, width, height)
        self.vx = 0
        self.vy = 0
        self.ax = 0
        self.ay = 0


class GridCollider(AbstractCollider):
    __slots__ = ('x', 'y', 'width', 'height', 'cell_size')

    def __init__(self, x: float, y: float, width: int, height: int, cell_size: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.cell_size = cell_size

        self.raw_grid: list[None | BoxCollider] = [None] * (width * height)

    def __getitem__(self, coordinates):
        return self.raw_grid[coordinates[0] * self.height + coordinates[1]]

    def __setitem__(self, coordinates, value):
        self.raw_grid[coordinates[0] * self.height + coordinates[1]] = value

