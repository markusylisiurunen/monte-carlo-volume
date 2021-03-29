"""
Generate a area function A(h) for a shape.
"""

import json
import sys

import matplotlib.pyplot as plt
import numpy as np


class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Polygon:
    def __init__(self, points):
        if len(points) != 3:
            raise ValueError

        self.points = points

    def is_within(self, point):
        def sign(p1, p2, p3):
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)

        d1 = sign(point, self.points[0], self.points[1])
        d2 = sign(point, self.points[1], self.points[2])
        d3 = sign(point, self.points[2], self.points[0])

        has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
        has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)

        return not (has_neg and has_pos)

class Shape:
    def __init__(self, polygons):
        if len(polygons) == 0:
            raise ValueError

        self.polygons = polygons

    def get_bounds(self):
        min_x, max_x = float("inf"), -1 * float("inf")
        min_y, max_y = float("inf"), -1 * float("inf")

        for polygon in self.polygons:
            for point in polygon.points:
                if point.x < min_x:
                    min_x = point.x

                if point.x > max_x:
                    max_x = point.x

                if point.y < min_y:
                    min_y = point.y

                if point.y > max_y:
                    max_y = point.y

        return min_x, min_y, max_x, max_y
    
    def is_within(self, point):
        for polygon in self.polygons:
            if polygon.is_within(point):
                return True

        return False

def read_polygons(file_name):
    polygons = []

    with open('./data/' + file_name + '.csv', 'r') as f:
        for i, line in enumerate(f.readlines()):
            if i == 0:
                continue

            coordinates = line.strip().split(",")
            coordinates = list(map(lambda x: float(x), coordinates))

            points = []

            for i in range(0, len(coordinates), 2):
                points.append(Point(coordinates[i], coordinates[i + 1]))

            polygons.append(Polygon(points))

    return polygons

def main(file_name):
    # a single slice height (cm)
    SLICE_HEIGHT = 0.5

    # number of samples for Monte Carlo simulation per slice
    SAMPLES_PER_SLICE = 10000

    # read in the data
    polygons = read_polygons(file_name)
    shape = Shape(polygons)

    # Monte Carlo simulation
    # ---

    min_x, min_y, max_x, max_y = shape.get_bounds()

    # the simulation starts from the very bottom and adds a new slice until it reaches the top
    current_h = max_y - SLICE_HEIGHT
    area = [0]

    while current_h > min_y - SLICE_HEIGHT:
        # compute the current rectangle boundaries
        rect_x_min, rect_x_max = min_x, max_x
        rect_y_min, rect_y_max = current_h, current_h + SLICE_HEIGHT
        
        # sample SAMPLES_PER_SLICE points uniformly within the rectangle
        xs = np.random.uniform(rect_x_min, rect_x_max, SAMPLES_PER_SLICE)
        ys = np.random.uniform(rect_y_min, rect_y_max, SAMPLES_PER_SLICE)

        # compute the ratio of points that hit within the shape
        count_inside = 0

        for i in range(SAMPLES_PER_SLICE):
            point = Point(xs[i], ys[i])

            if shape.is_within(point):
                count_inside += 1

        # compute the area of the shape within the rectangle
        rect_area = (rect_x_max - rect_x_min) * (rect_y_max - rect_y_min)
        shape_area = count_inside / SAMPLES_PER_SLICE * rect_area

        area.append(shape_area)

        # update the rectangle boundary
        current_h -= SLICE_HEIGHT

    # compute and plot the cumulative area function A(h)
    cumulative_area = [0]

    for i in range(1, len(area)):
        cumulative_area.append(cumulative_area[i - 1] + area[i])

    total_computed_height = max_y - current_h

    plt.plot(np.linspace(0, total_computed_height, len(area)), cumulative_area)
    plt.show()

    # output the (extrapolatable) cumulative area function for visualisation
    output_data = {}

    for i, a in enumerate(cumulative_area):
        h = i * SLICE_HEIGHT
        output_data[str(h)] = a

    with open('./data/' + file_name + '_out.json', 'w') as f:
        json.dump(output_data, f)


if len(sys.argv) != 2:
    print("Input file name must be passed.")
    sys.exit(1)

main(sys.argv[1])
