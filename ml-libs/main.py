from __future__ import print_function

import os.path
import pickle
import time
from argparse import ArgumentParser
from collections import Counter
from sys import argv

import numpy as np

from clustering import kmeans
from tsne import low_dim_mapper
from util import utils

DEFAULT_NO_CLUSTERS = 25
DEFAULT_INPUT_FILENAME = os.path.join('..', 'scripts', 'vision_api.json')
DEFAULT_OUTPUT_FILENAME = os.path.join('..', 'scripts', 'vision_api.galaxy.json')
DEFAULT_GLOVE_WORD2VEC_DIM = 200  # valid values are 50, 100, 150, 200, 250 and 300
DEFAULT_INITIAL_DIMS_AFTER_PCA = 50  # should be less or equal than glove word2vec dimension
DEFAULT_PERPLEXITY = 50
DEFAULT_THETA = 0.5  # 0.0 for theta is equivalent to vanilla t-SNE

NUMBER_OF_OUTPUT_DIMENSIONS = 3


def get_frequency_for_specific_label(labels_counter, specific_cluster_name):
    for label in labels_counter:
        if label[0] == specific_cluster_name:
            return label[1]
    return 0


def arg_parse():
    arg_parse = ArgumentParser('Google Vision API visualizer')
    arg_parse.add_argument('-i', '--input', type=str,
                           default=DEFAULT_INPUT_FILENAME)
    arg_parse.add_argument('-o', '--output', type=str,
                           default=DEFAULT_OUTPUT_FILENAME)
    arg_parse.add_argument('-c', '--no_clusters', type=int,
                           default=DEFAULT_NO_CLUSTERS)
    arg_parse.add_argument('-d', '--dimension', type=int,
                           default=DEFAULT_GLOVE_WORD2VEC_DIM)
    arg_parse.add_argument('-p', '--perplexity', type=float,
                           default=DEFAULT_PERPLEXITY)
    arg_parse.add_argument('-t', '--theta', type=float,
                           default=DEFAULT_THETA)
    arg_parse.add_argument('-a', '--pca_dims', type=int,
                           default=DEFAULT_INITIAL_DIMS_AFTER_PCA)
    arg_parse.add_argument('-n', '--specific_cluster_name', type=str,
                           default='')
    arg_parse.add_argument('-s', '--use_snapshot', action='store_true')
    arg_parse.add_argument('-b', '--output_dimension', type=int,
                           default=NUMBER_OF_OUTPUT_DIMENSIONS)
    return arg_parse


if __name__ == "__main__":

    print('#######################')
    print('# Program has started #')
    print('#######################')

    start_time = time.time()
    arg_p = arg_parse().parse_args(argv[1:])
    print('[ArgumentParser]', arg_p)

    x_vectors_filename = 'pickle/X_vectors.dat'
    x_labels_filename = 'pickle/X_labels.dat'
    x_images_ids = 'pickle/X_image_ids.dat'

    if arg_p.use_snapshot \
            and os.path.isfile(x_vectors_filename) \
            and os.path.isfile(x_labels_filename) \
            and os.path.isfile(x_images_ids):
        X_vectors = pickle.load(open(x_vectors_filename, 'r'))
        X_labels = pickle.load(open(x_labels_filename, 'r'))
        X_image_ids = pickle.load(open(x_images_ids, 'r'))
    else:
        [X_vectors, X_labels, X_image_ids] = low_dim_mapper.generate_vectors(json_input_filename=arg_p.input,
                                                                             dim=arg_p.output_dimension,
                                                                             w2v_dim=arg_p.dimension,
                                                                             perplexity=arg_p.perplexity,
                                                                             theta=arg_p.theta,
                                                                             pca_dims=arg_p.pca_dims)
        pickle.dump(X_vectors, open(x_vectors_filename, 'w'))
        pickle.dump(X_labels, open(x_labels_filename, 'w'))
        pickle.dump(X_image_ids, open(x_images_ids, 'w'))

    [c_centers, X_assignments, _] = kmeans.tf_k_means_cluster(X_vectors, no_clusters=arg_p.no_clusters)

    matlab_obj = {
        'vectors': X_vectors,
        'labels': X_labels,
        'assignments': X_assignments
    }

    # import scipy.io
    # scipy.io.savemat('vectors.mat', mdict=matlab_obj, appendmat=False, do_compression=False, oned_as='row')

    # TODO: optimize this code. Request from Google to have a specific cluster name such as CAT.
    labels = []
    max_frequency_specific_cluster = 0
    specific_cluster_id = -1
    data_points_in_specific_cluster_indexes = []
    for cluster_id in xrange(arg_p.no_clusters):
        data_points_in_cluster_indexes = [i for i, x in enumerate(X_assignments) if x == cluster_id]
        dominant_labels = list(X_labels[data_point_idx] for data_point_idx in data_points_in_cluster_indexes)
        most_common_labels = Counter(dominant_labels).most_common()

        frequency_specific_cluster = get_frequency_for_specific_label(most_common_labels, arg_p.specific_cluster_name)
        if frequency_specific_cluster >= max_frequency_specific_cluster:
            max_frequency_specific_cluster = frequency_specific_cluster
            specific_cluster_id = cluster_id

            data_points_in_specific_cluster_indexes = []
            for data_point_idx in data_points_in_cluster_indexes:
                if X_labels[data_point_idx] == arg_p.specific_cluster_name:
                    data_points_in_specific_cluster_indexes.append(data_point_idx)

        i = 0
        while most_common_labels[i][0] in labels:
            i += 1

        dominant_label = most_common_labels[i][0]
        frequency_dominant_label = most_common_labels[i][1]
        labels.append(dominant_label)

        print(cluster_id, '->', dominant_label, '(', frequency_dominant_label, '), center=', c_centers[cluster_id])

    if not arg_p.specific_cluster_name == '':
        specific_cluster_center = np.zeros(arg_p.output_dimension)
        for elt_id in data_points_in_specific_cluster_indexes:
            X_assignments[elt_id] = arg_p.no_clusters
            specific_cluster_center += X_vectors[elt_id]
        specific_cluster_center /= max_frequency_specific_cluster

        c_centers = np.vstack((c_centers, specific_cluster_center))
        labels.append(arg_p.specific_cluster_name)

        print(arg_p.no_clusters, '->', labels[-1],
              '(count=', max_frequency_specific_cluster,
              '- specific), center=', specific_cluster_center)

    utils.convert_to_json(X_vectors, X_assignments, c_centers, labels, X_image_ids, filename=arg_p.output)
    print("Program took {0:.2f} seconds to execute.".format(time.time() - start_time))
