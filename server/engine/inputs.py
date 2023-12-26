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
    Hit = 1
    Press = 2
    PressOut = 3


class InputRegistry:
    def __init__(self):
        self.pressed: set[InputAction] = set()
        self.clicked: set[InputAction] = set()

    def register_input(self, action: InputAction, input_type: InputType):
        match input_type:
            case InputType.Press:
                self.pressed.add(action)
            case InputType.PressOut:
                self.pressed.remove(action)
            case InputType.Hit:
                self.clicked.remove(action)

    def get_clicked(self):
        if self.clicked:
            clicked = self.clicked
            self.clicked = set()
            return clicked
        return None