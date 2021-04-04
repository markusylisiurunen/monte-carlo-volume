import json

import numpy as np


def main():
    RADIUS = 0.2
    POLYGON_COUNT = 12

    polygons = []

    for i in range(POLYGON_COUNT):
        angle_start = i * 2 * np.pi / POLYGON_COUNT
        angle_end = (i + 1) * 2 * np.pi / POLYGON_COUNT

        polygons.append([
            0,
            0,
            np.cos(angle_start) * RADIUS,
            np.sin(angle_start) * RADIUS,
            np.cos(angle_end) * RADIUS,
            np.sin(angle_end) * RADIUS,
        ])

    output_data = 'point_1_x, point_1_y, point_2_x, point_2_y, point_3_x, point_3_y'

    for polygon in polygons:
        output_data += '\n'
        output_data += ','.join(list(map(lambda x: str(x), polygon)))

    output_data += '\n'

    with open('./data/circle_' + str(RADIUS).replace('.', '-') + '.csv', 'w') as f:
        f.write(output_data)

main()
