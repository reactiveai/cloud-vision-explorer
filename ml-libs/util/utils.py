from __future__ import print_function

import json

import numpy as np

import word2vec


def scale_max_abs(ax):
    normalised_constant = np.abs(ax).max()
    return ax / normalised_constant


def convert_to_json(x_norm, assignments, centers, labels, ids, filename):
    output_dim = x_norm.shape[1]
    data_x = []
    for i in xrange(len(assignments)):

        if output_dim == 3:
            elt = {
                'x': x_norm[i, 0],
                'y': x_norm[i, 1],
                'z': x_norm[i, 2],
                'i': ids[i],
                'g': assignments[i]
            }
        else:
            elt = {
                'x': x_norm[i, 0],
                'y': x_norm[i, 1],
                'i': ids[i],
                'g': assignments[i]
            }
        data_x.append(elt)

    data_centers = []
    for i in xrange(len(centers)):

        if output_dim == 3:
            elt = {
                'x': centers[i, 0],
                'y': centers[i, 1],
                'z': centers[i, 2],
                'label': labels[i]
            }
        else:
            elt = {
                'x': centers[i, 0],
                'y': centers[i, 1],
                'label': labels[i]
            }
        data_centers.append(elt)

    data = {
        'points': data_x,
        'clusters': data_centers
    }

    with open(filename, 'w') as outfile:
        json.dump(data, outfile)
        print('wrote output to', filename)


def enrich_map_with_word2vec(label_map, w2v):
    for idx, labels in label_map.iteritems():
        for label in labels:
            desc = label['description']
            vec = word2vec.process_word(desc, w2v, silent=True)
            label['word2vec'] = vec


def generate_label_map(json_input_filename):
    count = 0
    with open(json_input_filename) as data_file:
        label_map = dict()
        data = json.load(data_file)
        for i, record in enumerate(data):
            try:
                idx = str(record['imageId'])
                label_map[idx] = record['labelAnnotations']
                count += 1
            except Exception:
                pass
    print("[utils] loaded", count, "images")
    return label_map


def load_json(json_input_filename, w2v_dim=50):
    w2v = word2vec.load_glove(w2v_dim)
    print('[utils] reading from', json_input_filename)
    label_map = generate_label_map(json_input_filename)
    enrich_map_with_word2vec(label_map, w2v)
    return label_map
