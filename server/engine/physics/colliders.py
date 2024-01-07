from abc import ABC

from server.engine.user import SharedFloat


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

    def set_vx(self, vx: float):
        self.vx = vx

    def set_vy(self, vy: float):
        self.vy = vy


class InertiaBoxColliderMultiprocess(InertiaBoxCollider):

    def __init__(
            self,
            x: SharedFloat,
            y: SharedFloat,
            width: float,
            height: float,
            vx: SharedFloat,
            vy: SharedFloat,
    ):
        self._x = x
        self._y = y
        self._vx = vx
        self._vy = vy

        super().__init__(x.read(), y.read(), width, height)
        self.vx = self._vx.read()
        self.vy = self._vy.read()
        self.ax = 0
        self.ay = 0

    def set_x(self, x: float):
        self.x = x
        self._x.write(x)
        self.left = self.x - self.half_width
        self.right = self.x + self.half_width

    def set_y(self, y: float):
        self.y = y
        self._y.write(y)
        self.bottom = self.y - self.half_height
        self.top = self.y + self.half_height

    def set_vx(self, vx: float):
        self.vx = vx
        self._vx.write(vx)

    def set_vy(self, vy: float):
        self.vy = vy
        self._vy.write(vy)


class HasBoxCollider(ABC):
    ph_collider: BoxCollider = NotImplemented


class HasInertiaBoxCollider(ABC):
    ph_collider: InertiaBoxCollider = NotImplemented


class HasInertiaBoxColliderMultiprocess(ABC):
    ph_collider: InertiaBoxColliderMultiprocess = NotImplemented

