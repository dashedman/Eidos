from typing import Self, Literal

from server.engine.entities import User
from server.engine.logic.states.abstract import AbstractState


class BaseState(AbstractState):

    def __init__(self, user: User):
        self.state_lifetime = 0.0
        self.user = user

    def change_state(
            self,
            state_cls: type[Self],
            direction: Literal[-1, 1, None] = None,
    ):
        return self.user.change_state(state_cls, direction)

    def on_start(self):
        pass

    def on_finish(self):
        pass

    def update(self, time_delta: float):
        self.state_lifetime += time_delta
        self.update_physic(time_delta)

        self.update_by_physic(time_delta)
        self.update_by_state(time_delta)

    def update_physic(self, time_delta: float):
        pass

    def update_by_physic(self, time_delta: float):
        pass

    def update_by_state(self, time_delta: float):
        pass
