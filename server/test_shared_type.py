import multiprocessing
import time

from server.engine.utils.shared_types import SharedFloat


def p2f(queue):
    while True:
        time.sleep(0.5)
        if not queue.empty():
            name = queue.get_nowait()
            fl = SharedFloat.from_name(name)
            print('p2', fl.read())
            fl.write(3.4567)
            print('p2', fl.read())


def main():
    queue = multiprocessing.Queue()
    p2 = multiprocessing.Process(target=p2f, name='p2', args=(queue,))
    p2.start()

    fl = SharedFloat.from_float(1.2345)
    print(fl.read())
    fl.write(2.3456)
    print(fl.read())

    queue.put_nowait(fl.name)
    time.sleep(2)
    print('p1', fl.read())


if __name__ == '__main__':
    main()
