from typing import Literal

from server.engine.logic.states.base import BaseState
from server.engine.logic.states.main_states import StayingState
from server.engine.physics import HasInertiaBoxColliderMultiprocess, InertiaBoxColliderMultiprocess


class User(HasInertiaBoxColliderMultiprocess):
    ACCELERATION = 15
    MAX_SPEED = 10
    JUMP_START_SPEED = 18
    JUMP_ACCELERATION = ACCELERATION

    WINDUP_DURATION = 1
    LANDING_DURATION = 1

    def __init__(
            self,
            session_id: int,
            ph_collider: InertiaBoxColliderMultiprocess,
            command_flags: list[bool],
    ):
        self.session_id = session_id
        self.sight_distance = 4
        self.ph_collider = ph_collider
        self.command_flags: list[bool] = command_flags
        self.cf = self.command_flags    # alias
        self.state: BaseState = StayingState(self)
        self.direction: Literal[-1, 1] = 1

    def change_state(
            self,
            state_cls: type[BaseState],
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
