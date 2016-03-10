import json

import numpy as np

import word2vec


def scale_max_abs(ax):
    normalised_constant = np.abs(ax).max()
    return ax / normalised_constant


def convert_to_json(x_norm, assignments, centers, labels, filename):
    data_x = []
    for i in xrange(len(assignments)):
        elt = {
            'x': x_norm[i, 0],
            'y': x_norm[i, 1],
            'z': x_norm[i, 2],
            'i': str(i).zfill(33),  # TODO: change it to real id
            'g': assignments[i]
        }
        data_x.append(elt)

    data_centers = []
    for i in xrange(len(centers)):
        elt = {
            'x': centers[i, 0],
            'y': centers[i, 1],
            'z': centers[i, 2],
            'label': labels[i]
        }
        data_centers.append(elt)

    data = {
        'points': data_x,
        'clusters': data_centers
    }

    with open(filename, 'w') as outfile:
        json.dump(data, outfile)


def enrich_map_with_word2vec(label_map, w2v):
    for idx, labels in label_map.iteritems():
        for label in labels:
            desc = label['description']
            vec = word2vec.process_word(desc, w2v, silent=True)
            label['word2vec'] = vec


def generate_label_map(json_input_filename):
    with open(json_input_filename) as data_file:
        label_map = {}
        data = json.load(data_file)['responses']
        for idx, record in enumerate(data):
            try:
                label_map[idx] = record['labelAnnotations']
            except KeyError:
                pass
    return label_map


def load_json(json_input_filename):
    w2v = word2vec.load_glove(50)
    label_map = generate_label_map(json_input_filename)
    enrich_map_with_word2vec(label_map, w2v)
    return label_map
