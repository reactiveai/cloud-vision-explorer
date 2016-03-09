import json
import numpy as np


def scale_unit_variance_mean_zero(ax):
    return (ax - np.mean(ax, axis=0)) / np.std(ax, axis=0)


# np.amax(np.abs(ax / np.amax(np.abs(ax), axis=0)), axis=0) = [1.0, 1.0, 1.0]
def scale_max_abs(ax):
    return ax / np.amax(np.abs(ax), axis=0)


def convert_to_json(X, assignments, filename):
    data = []
    X = scale_max_abs(X)
    for i in xrange(len(assignments)):
        elt = {
            'x': X[i, 0],
            'y': X[i, 1],
            'z': X[i, 2],
            'i': str(i).zfill(33),
            'g': assignments[i]
        }
        data.append(elt)

    with open(filename, 'w') as outfile:
        json.dump(data, outfile)
