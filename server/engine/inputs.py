import ctypes
import multiprocessing
from enum import IntEnum


class InputAction(IntEnum):
    MoveLeft = 1
    MoveRight = 2
    MoveUp = 3
    MoveDown = 4
    Jump = 5
    Dash = 6
    Attack1 = 7
    Attack2 = 8
    Ability = 9
    Item = 10


class InputType(IntEnum):
    PressOut = 0
    Press = 1


class InputRegistry:
    def __init__(self):
        self.command_flags: list[bool] = multiprocessing.Array(ctypes.c_bool, 16, lock=False)

    def register_input(self, action: InputAction, input_type: InputType):
        match input_type:
            case InputType.PressOut:
                self.command_flags[action.value] = False
            case InputType.Press:
                self.command_flags[action.value] = True
