import struct
from multiprocessing.shared_memory import SharedMemory


BOOL_SIZE = 1
FLOAT_SIZE = 4


class SharedFloat:
    __slots__ = 'shared'
    shared: SharedMemory

    @classmethod
    def from_float(cls, value: float = 0.0):
        obj = cls()
        obj.shared = SharedMemory(create=True, size=FLOAT_SIZE)
        obj.write(value)
        return obj

    @classmethod
    def from_name(cls, name: str):
        obj = cls()
        obj.shared = SharedMemory(name=name)
        return obj

    @property
    def name(self):
        return self.shared.name

    def read(self) -> float:
        return struct.unpack('f', self.shared.buf[:FLOAT_SIZE])[0]

    def write(self, value: float):
        self.shared.buf[:FLOAT_SIZE] = struct.pack('f', value)

    def close(self):
        self.shared.close()
        self.shared.unlink()


class SharedBoolList:
    __slots__ = 'shared'
    shared: SharedMemory

    @classmethod
    def from_list(cls, value: list[bool]):
        obj = cls()
        obj.shared = SharedMemory(create=True, size=BOOL_SIZE * len(value))
        for i in range(len(value)):
            obj[i] = value[i]
        return obj

    @classmethod
    def from_name(cls, name: str):
        obj = cls()
        obj.shared = SharedMemory(name=name)
        return obj

    @property
    def name(self):
        return self.shared.name

    def __getitem__(self, item) -> bool:
        return struct.unpack('b', self.shared.buf[item:item + BOOL_SIZE])[0]

    def __setitem__(self, item, value: bool):
        self.shared.buf[item:item + BOOL_SIZE] = struct.pack('b', value)

    def close(self):
        self.shared.close()
        self.shared.unlink()
