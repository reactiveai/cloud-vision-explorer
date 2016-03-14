from __future__ import print_function

import time
from argparse import ArgumentParser
from collections import Counter
from sys import argv

from clustering import kmeans
from tsne import low_dim_mapper
from util import json_utils

DEFAULT_NO_CLUSTERS = 10
DEFAULT_INPUT_FILENAME = 'input.json'
DEFAULT_OUTPUT_FILENAME = 'output.json'
DEFAULT_GLOVE_WORD2VEC_DIM = 50  # valid values are 50, 100, 150, 200, 250 and 300
DEFAULT_INITIAL_DIMS_AFTER_PCA = 50  # should be less or equal than glove word2vec dimension
DEFAULT_PERPLEXITY = 50
DEFAULT_THETA = 0.5  # 0.0 for theta is equivalent to vanilla t-SNE


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
    return arg_parse


if __name__ == "__main__":

    print('#######################')
    print('# Program has started #')
    print('#######################')

    start_time = time.time()
    arg_p = arg_parse().parse_args(argv[1:])
    print('[ArgumentParser]', arg_p)

    [X_vectors, X_labels, X_image_ids] = low_dim_mapper.generate_vectors(json_input_filename=arg_p.input,
                                                                         dim=3,
                                                                         w2v_dim=arg_p.dimension,
                                                                         perplexity=arg_p.perplexity,
                                                                         theta=arg_p.theta,
                                                                         pca_dims=arg_p.pca_dims)

    [c_centers, X_assignments, _] = kmeans.tf_k_means_cluster(X_vectors, no_clusters=arg_p.no_clusters)

    labels = []
    for cluster_id in xrange(arg_p.no_clusters):
        data_points_in_cluster_indexes = [i for i, x in enumerate(X_assignments) if x == cluster_id]
        dominant_labels = list(X_labels[data_point_idx] for data_point_idx in data_points_in_cluster_indexes)
        most_common_labels = Counter(dominant_labels).most_common()
        dominant_label = most_common_labels[0][0]
        frequency_dominant_label = most_common_labels[0][1]
        labels.append(dominant_label)
        print(cluster_id, '->', dominant_label, '(', frequency_dominant_label, '), center=', c_centers[cluster_id])

    json_utils.convert_to_json(X_vectors, X_assignments, c_centers, labels, X_image_ids, filename=arg_p.output)
    print("Program took {0:.2f} seconds to execute.".format(time.time() - start_time))
