import math


def point_line_orientation(lx, ly, dx, dy, px, py):
    """

    :param lx: X coord of point on line
    :param ly: Y coord of point on line
    :param dx: X coord of direction vector for line
    :param dy: Y coord of direction vector for line
    :param px: X coord of point
    :param py: X coord of point
    :return: 0 if point on line, -1 if lefthand, 1 if righthand
    """
    return math.copysign(1, (px - lx) * dy - (py - ly) * dx)
