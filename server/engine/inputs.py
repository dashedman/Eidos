from enum import IntEnum

from server.engine.utils.shared_types import SharedBoolList


class InputAction(IntEnum):
    """
    front\\js\\engine\\entities\\creatures\\character\\commander\\base.js commands nust be same
    """
    Stay = 0
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
    Press = 0
    PressOut = 1


class InputRegistry:
    def __init__(self):
        self.command_flags: SharedBoolList = SharedBoolList.from_list([False] * 16)

    def register_input(self, action: InputAction, input_type: InputType):

        print(input_type.name, action.name)
        match input_type:
            case InputType.PressOut:
                self.command_flags[action.value] = False
            case InputType.Press:
                self.command_flags[action.value] = True

    def close(self):
        self.command_flags.close()
