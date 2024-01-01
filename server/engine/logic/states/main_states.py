from server.engine.inputs import InputAction
from server.engine.logic.states.base import BaseState


class StayingState(BaseState):
    def update_physic(self, time_delta: float):
        # stoping
        vx = self.user.ph_collider.vx
        if vx:
            limit_func, sign = (max, 1) if vx > 0 else (min, -1)

            self.user.ph_collider.set_vx(
                limit_func(
                    0,
                    vx - sign * self.user.ACCELERATION * 5 * time_delta
                )
            )

    def update_by_physic(self, time_delta: float):
        if self.user.ph_collider.vy < 0:
            return self.change_state(FallingState)
        elif self.user.ph_collider.vy > 0:
            return self.change_state(JumpingState)

    def update_by_state(self, time_delta):
        vx = self.user.ph_collider.vx
        if vx:
            limit_func, sign = (max, 1) if vx > 0 else (min, -1)

            self.user.ph_collider.set_vx(
                limit_func(
                    0,
                    vx - sign * self.user.ACCELERATION * 5 * time_delta
                )
            )
        elif self.user.cf[InputAction.MoveRight] ^ self.user.cf[InputAction.MoveLeft]:

            if self.user.cf[InputAction.MoveRight]:
                return self.change_state(WindupState, 1)

            if self.user.cf[InputAction.MoveLeft]:
                return self.change_state(WindupState, -1)

        if self.user.cf[InputAction.Jump]:
            return self.change_state(JumpingState)


class MovingState(BaseState):
    def update_physic(self, time_delta: float):
        # moving
        limit_func = min if self.user.direction > 0 else max

        self.user.ph_collider.set_vx(limit_func(
            self.user.ph_collider.vx +
            self.user.direction * self.user.ACCELERATION * time_delta,
            self.user.direction * self.user.MAX_SPEED
        ))

    def update_by_physic(self, time_delta: float):

        if self.user.ph_collider.vy < 0:
            return self.change_state(FallingState)
        elif self.user.ph_collider.vy > 0:
            return self.change_state(JumpingState)

    def update_by_state(self, time_delta: float):

        if self.user.cf[InputAction.Jump]:
            # Jump
            return self.change_state(JumpingState)

        if (
                # unpressed keys by direction
                self.user.direction > 0 and not self.user.cf[InputAction.MoveRight] or
                self.user.direction < 0 and not self.user.cf[InputAction.MoveLeft] or
                # or double pressed - double direction run - conflict
                not (self.user.cf[InputAction.MoveLeft] ^ self.user.cf[InputAction.MoveRight])
        ):
            return self.change_state(StayingState)


class WindupState(MovingState):
    def update_by_state(self, time_delta: float):
        # next state
        if self.state_lifetime > self.user.WINDUP_DURATION:
            return self.change_state(MovingState)

        if not (self.user.cf[InputAction.MoveLeft] ^ self.user.cf[InputAction.MoveRight]):
            # unpressed keys or
            # double pressed - double direction run - conflict
            return self.change_state(StayingState)


class JumpingState(BaseState):
    def on_start(self):
        vy = self.user.ph_collider.vy
        if vy <= 0:
            self.user.ph_collider.set_vy(
                vy + self.user.JUMP_START_SPEED
            )

    def update_physic(self, time_delta: float):
        # stopping
        vx = self.user.ph_collider.vx
        if vx:
            limit_func, sign = (max, 1) if vx > 0 else (min, -1)

            self.user.ph_collider.set_vx = limit_func(
                0,
                vx - sign * self.user.JUMP_ACCELERATION * time_delta
            )

    def update_by_physic(self, time_delta: float):
        if self.user.ph_collider.vy < 0:
            return self.change_state(FallingState)

    def update_by_state(self, time_delta: float):
        if self.user.cf[InputAction.MoveRight] ^ self.user.cf[InputAction.MoveLeft]:

            if self.user.cf[InputAction.MoveRight]:
                return self.change_state(JumpingMoveState, 1)

            if self.user.cf[InputAction.MoveLeft]:
                return self.change_state(JumpingMoveState, -1)


class JumpingMoveState(JumpingState):
    def update_physic(self, time_delta: float):
        limit_func = min if self.user.direction > 0 else max

        self.user.ph_collider.vx = limit_func(
            self.user.ph_collider.vx +
            self.user.direction * self.user.JUMP_ACCELERATION * time_delta,
            self.user.direction * self.user.MAX_SPEED
        )

    def update_by_physic(self, time_delta: float):
        if self.user.ph_collider.vy < 0:
            return self.change_state(FallingMoveState)

    def update_by_state(self, time_delta: float):
        if (
                # unpressed keys by direction
                self.user.direction > 0 and not self.user.cf[InputAction.MoveRight] or
                self.user.direction < 0 and not self.user.cf[InputAction.MoveLeft] or
                # unpresed keys or double pressed - double direction run - conflict
                not (self.user.cf[InputAction.MoveLeft] ^ self.user.cf[InputAction.MoveRight])
        ):
            return self.change_state(JumpingState)


class FallingState(BaseState):
    # TODO: same from JumpingState, add DRY
    def update_physic(self, time_delta: float):
        # stopping
        vx = self.user.ph_collider.vx
        if vx:
            limit_func, sign = (max, 1) if vx > 0 else (min, -1)

            self.user.ph_collider.set_vx = limit_func(
                0,
                vx - sign * self.user.JUMP_ACCELERATION * time_delta
            )

    def update_by_physic(self, time_delta: float):
        if self.user.ph_collider.vy > 0:
            return self.change_state(JumpingState)
        elif self.user.ph_collider.vy == 0:
            return self.change_state(LandingState)

    def update_by_state(self, time_delta: float):
        if self.user.cf[InputAction.MoveRight] ^ self.user.cf[InputAction.MoveLeft]:
            if self.user.cf[InputAction.MoveRight]:
                if self.user.ph_collider.vx >= 0:
                    return self.change_state(FallingMoveState, 1)
                elif self.user.direction < 0:
                    return self.change_state(FallingState, 1)

            if self.user.cf[InputAction.MoveLeft]:
                if self.user.ph_collider.vx <= 0:
                    return self.change_state(FallingMoveState, -1)
                elif self.user.direction > 0:
                    return self.change_state(FallingState, -1)


class FallingMoveState(FallingState):
    # TODO: same from JumpingMoveState, add DRY
    def update_physic(self, time_delta: float):
        limit_func = min if self.user.direction > 0 else max

        self.user.ph_collider.vx = limit_func(
            self.user.ph_collider.vx +
            self.user.direction * self.user.JUMP_ACCELERATION * time_delta,
            self.user.direction * self.user.MAX_SPEED
        )

    def update_by_physic(self, time_delta: float):
        if self.user.ph_collider.vy > 0:
            return self.change_state(JumpingMoveState)
        elif self.user.ph_collider.vy == 0:
            return self.change_state(LandingMoveState)

    def update_by_state(self, time_delta: float):
        if (
                # unpressed keys by direction
                self.user.direction > 0 and not self.user.cf[InputAction.MoveRight] or
                self.user.direction < 0 and not self.user.cf[InputAction.MoveLeft] or
                # unpresed keys or
                # double pressed - double direction run - conflict
                not (self.user.cf[InputAction.MoveLeft] ^ self.user.cf[InputAction.MoveRight])
        ):
            return self.change_state(FallingState)


class LandingState(BaseState):
    # TODO: same from StayingState, add DRY
    def update_physic(self, time_delta: float):
        # stopping
        vx = self.user.ph_collider.vx
        if vx:
            limit_func, sign = (max, 1) if vx > 0 else (min, -1)

            self.user.ph_collider.set_vx(
                limit_func(
                    0,
                    vx - sign * self.user.ACCELERATION * 5 * time_delta
                )
            )

    def update_by_physic(self, time_delta: float):
        if self.user.ph_collider.vy < 0:
            return self.change_state(FallingState)

    def update_by_state(self, time_delta: float):

        if self.state_lifetime > self.user.LANDING_DURATION:
            return self.change_state(StayingState)


class LandingMoveState(LandingState):
    # TODO: same from MovingState, add DRY
    def update_physic(self, time_delta: float):
        # moving
        limit_func = min if self.user.direction > 0 else max

        self.user.ph_collider.set_vx(limit_func(
            self.user.ph_collider.vx +
            self.user.direction * self.user.ACCELERATION * time_delta,
            self.user.direction * self.user.MAX_SPEED
        ))

    # TODO: same from WindupState, add DRY
    def update_by_state(self, time_delta: float):
        # next state
        if self.state_lifetime > self.user.WINDUP_DURATION:
            return self.change_state(MovingState)

        if not (self.user.cf[InputAction.MoveLeft] ^ self.user.cf[InputAction.MoveRight]):
            # unpressed keys or
            # double pressed - double direction run - conflict
            return self.change_state(StayingState)

