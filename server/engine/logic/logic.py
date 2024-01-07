from server.engine import game_app


class GameLogicEngine:
    def __init__(self, backend: 'game_app.GameBackend'):
        self.backend = backend

    def tick(self, time_delta: float):
        for user in self.backend.users:
            list_cell = self.backend.map.check_user_map(user)
            if list_cell:
                self.backend.queue_to_frontend.put_nowait(
                    (game_app.QueueCode.TakeMap, (user.session_id, list_cell))
                )

            user.update(time_delta)





