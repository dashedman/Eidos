class GameAPIError(BaseException):
    pass


class BadWebsocketRequest(GameAPIError):
    message: str
    def __init__(self, message = 'Bad Websocket Request'):
        super()
        self.message = message
