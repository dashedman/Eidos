from abc import ABC


class AbstractCollider(ABC):
    pass


class BoxCollider(AbstractCollider):
    __slots__ = (
        'x', 'y',
        'width', 'half_width',
        'height', 'half_height',
        'left', 'right', 'bottom', 'top',
    )
    x: float
    y: float
    width: float
    half_width: float
    height: float
    half_height: float

    left: float
    right: float
    bottom: float
    top: float

    def __init__(self, x: float, y: float, width: float, height: float):
        self.set_width(width)
        self.set_height(height)
        self.set_x(x)
        self.set_y(y)

    def set_width(self, width: float):
        self.width = width
        self.half_width = width * 0.5

    def set_height(self, height: float):
        self.height = height
        self.half_height = height * 0.5

    def set_x(self, x: float):
        self.x = x
        self.left = self.x - self.half_width
        self.right = self.x + self.half_width

    def set_y(self, y: float):
        self.y = y
        self.bottom = self.y - self.half_height
        self.top = self.y + self.half_height


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


class HasBoxCollider(ABC):
    ph_collider: BoxCollider = NotImplemented


class HasInertiaBoxCollider(ABC):
    ph_collider: InertiaBoxCollider = NotImplemented

