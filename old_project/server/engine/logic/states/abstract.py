from abc import abstractmethod


class AbstractState:
    @abstractmethod
    def update(self, time_delta: float):
        """
        Function to update state in tick

        :return:
        """

    @abstractmethod
    def on_start(self):
        """
        Function that will be call when state is created

        :return:
        """

    @abstractmethod
    def on_finish(self):
        """
        Function that will be call when state is deleted

        :return:
        """


class HasState:
    state: AbstractState
