from .game_app import GameBackend


class GameLogicEngine:
    def __init__(self, backend: GameBackend):
        self.backend = backend

    def tick(self, time_delta: float):
        pass
