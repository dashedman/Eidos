from server.engine.physics import HasInertiaBoxCollider


class User(HasInertiaBoxCollider):
    def __init__(self, ph_collider):
        self.sight_distance = 4
        self.ph_collider = ph_collider


class UsersManager:
    def __init__(self):
        self.users: dict[int, User] = {}

    def __iter__(self):
        return self.users.values()

    def colliders(self):
        for user in self.users.values():
            yield user.ph_collider
