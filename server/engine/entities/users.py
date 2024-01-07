from typing import Literal

from ..logic import states
from ..physics import HasInertiaBoxColliderMultiprocess, InertiaBoxColliderMultiprocess
from ..utils.shared_types import SharedBoolList


class User(HasInertiaBoxColliderMultiprocess):
    ACCELERATION = 15
    MAX_SPEED = 10
    JUMP_START_SPEED = 18
    JUMP_ACCELERATION = ACCELERATION

    windup_duration: float
    landing_duration: float

    def __init__(
            self,
            session_id: int,
            ph_collider: InertiaBoxColliderMultiprocess,
            command_flags: SharedBoolList,
    ):
        self.session_id = session_id
        self.sight_distance = 10
        self.ph_collider = ph_collider
        self.command_flags: SharedBoolList = command_flags
        self.cf = self.command_flags    # alias
        self.state: states.BaseState = states.StayingState(self)
        self.direction: Literal[-1, 1] = 1

    def change_state(
            self,
            state_cls: type[states.BaseState],
            direction: Literal[-1, 1, None] = None,
    ):
        if direction is not None:
            self.direction = direction

        print(state_cls.__name__, 'right' if self.direction > 0 else 'left')

        self.state.on_finish()
        self.state = state_cls(self)
        self.state.on_start()

    def update(self, time_delta: float):
        self.state.update(time_delta)


class UsersManager:
    def __init__(self):
        self.users: set[User] = set()

    def __iter__(self):
        return iter(self.users)

    def add(self, new_user: User):
        self.users.add(new_user)

    def colliders(self):
        for user in self.users:
            yield user.ph_collider
