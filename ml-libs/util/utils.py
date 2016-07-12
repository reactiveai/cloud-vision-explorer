from __future__ import print_function

import json
import pickle
from collections import Counter

import numpy as np

import kmeans
import word2vec

embeddings_pkl = 'pickle/embeddings.dat'
x_labels_pkl = 'pickle/labels.dat'
x_images_ids_pkl = 'pickle/image_ids.dat'
highdim_vectors_pkl = 'pickle/highdim_vectors.dat'


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
        print('[utils] wrote output to', filename)


def enrich_map_with_word2vec(label_map, w2v):
    for idx, labels in label_map.iteritems():
        for label in labels:
            desc = label['description']
            vec = word2vec.process_word(desc, w2v, silent=True)
            label['word2vec'] = vec


def generate_label_map(json_input_filename):
    with open(json_input_filename) as data_file:
        label_map = dict()
        data = json.load(data_file)
        for record in data:
            try:
                idx = str(record['imageId'])
                label_map[idx] = record['labelAnnotations']
            except Exception:
                pass
    print('[utils] {} images loaded.'.format(len(label_map)))
    return label_map


def load_json(json_input_filename, w2v_dim):
    print('[utils] reading from {}.'.format(json_input_filename))
    label_map = generate_label_map(json_input_filename)
    w2v = word2vec.get_glove_handler(w2v_dim)
    enrich_map_with_word2vec(label_map, w2v)
    return label_map


def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.sqrt(np.sum(np.array(v1) ** 2)) * np.sqrt(np.sum(np.array(v2) ** 2)))


def print_metrics(x_assignments, x_labels, cluster_labels, _highdim_vectors, w2v_dim):
    n = len(x_assignments)
    acc = np.zeros(n)
    c_dists = np.zeros(n)
    for i in range(n):
        cluster_id = x_assignments[i]
        assigned_label = cluster_labels[cluster_id]
        acc[i] = (assigned_label in x_labels[i])
        w2v = word2vec.get_glove_handler(dim=w2v_dim)
        c_dists[i] = cosine_similarity(_highdim_vectors[i], word2vec.process_word(assigned_label, w2v, silent=True))
    word_accuracy_lb = np.mean(acc)
    cos_dist = np.mean(c_dists)
    no_clusters = len(cluster_labels)
    print_s = '[utils] accuracy lower bound = {}, cosine similarity = {}, ' \
              'no_clusters = {}'.format(word_accuracy_lb, cos_dist, no_clusters)
    print(print_s)


def save_snapshot(embeddings, labels, image_ids, highdim_vectors):
    print('[utils] writing snapshot.')
    pickle.dump(embeddings, open(embeddings_pkl, 'w'))
    pickle.dump(labels, open(x_labels_pkl, 'w'))
    pickle.dump(image_ids, open(x_images_ids_pkl, 'w'))
    pickle.dump(highdim_vectors, open(highdim_vectors_pkl, 'w'))


def load_snapshot():
    print('[utils] reading snapshot.')
    embeddings = pickle.load(open(embeddings_pkl, 'r'))
    labels = pickle.load(open(x_labels_pkl, 'r'))
    image_ids = pickle.load(open(x_images_ids_pkl, 'r'))
    highdim_vectors = pickle.load(open(highdim_vectors_pkl, 'r'))
    return embeddings, labels, image_ids, highdim_vectors


def get_clusters(embeddings, no_clusters, labels):
    [c_centers, assignments, _] = kmeans.tf_k_means_cluster(embeddings, no_clusters=no_clusters)
    c_labels = []
    for cluster_id in xrange(no_clusters):
        data_points_in_cluster_indexes = [i for i, x in enumerate(assignments) if x == cluster_id]
        dominant_labels = list(labels[data_point_idx] for data_point_idx in data_points_in_cluster_indexes)
        most_common_labels = Counter(sum(dominant_labels, [])).most_common()  # no need to take the scores. unbiased.
        i = 0
        while most_common_labels[i][0] in c_labels:
            i += 1
        dominant_label = most_common_labels[i][0]
        frequency_dominant_label = most_common_labels[i][1]
        c_labels.append(dominant_label)

        print('{} -> {} ( {} ), center = {}'.format(
            cluster_id, dominant_label,
            frequency_dominant_label,
            c_centers[cluster_id]))
    return assignments, c_centers, c_labels
