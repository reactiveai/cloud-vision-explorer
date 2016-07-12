from __future__ import print_function

import os.path
import time
from argparse import ArgumentParser
from sys import argv

from tsne import low_dim_mapper
from util import utils

DEFAULT_INPUT_FILENAME = os.path.join('..', 'scripts', 'vision_api.json')
DEFAULT_OUTPUT_FILENAME = os.path.join('..', 'scripts', 'vision_api.galaxy.json')
DEFAULT_GLOVE_WORD2VEC_DIM = 200  # valid values are 50, 100, 150, 200, 250 and 300
DEFAULT_INITIAL_DIMS_AFTER_PCA = 50  # should be less or equal than glove word2vec dimension
DEFAULT_PERPLEXITY = 50
DEFAULT_THETA = 0.5  # 0.0 for theta is equivalent to vanilla t-SNE
DEFAULT_NO_CLUSTERS = 30


def get_arg_parse():
    arg_parse = ArgumentParser('Google Cloud Vision Explorer ML Libs')
    arg_parse.add_argument('-i', '--input', type=str,
                           default=DEFAULT_INPUT_FILENAME)
    arg_parse.add_argument('-o', '--output', type=str,
                           default=DEFAULT_OUTPUT_FILENAME)
    arg_parse.add_argument('-d', '--dimension', type=int,
                           default=DEFAULT_GLOVE_WORD2VEC_DIM)
    arg_parse.add_argument('-p', '--perplexity', type=float,
                           default=DEFAULT_PERPLEXITY)
    arg_parse.add_argument('-t', '--theta', type=float,
                           default=DEFAULT_THETA)
    arg_parse.add_argument('-a', '--pca_dims', type=int,
                           default=DEFAULT_INITIAL_DIMS_AFTER_PCA)
    arg_parse.add_argument('-s', '--use_snapshot', action='store_true')
    return arg_parse


if __name__ == "__main__":
    print('#######################')
    print('# Program has started #')
    print('#######################')

    start_time = time.time()
    arg_p = get_arg_parse().parse_args(argv[1:])
    print('[ArgumentParser]', arg_p)

    load_snapshot = False
    embeddings = None  # definitions added here for the compiler.
    X_labels = None
    X_image_ids = None
    highdim_vectors = None
    if arg_p.use_snapshot:
        try:
            embeddings, X_labels, X_image_ids, highdim_vectors = utils.load_snapshot()
            load_snapshot = True
        except IOError:
            print('Could not read snapshots. Have you run the program at least once?')

    if not load_snapshot:
        [embeddings, X_labels, X_image_ids, highdim_vectors] = low_dim_mapper.generate_vectors(
            json_input_filename=arg_p.input,
            w2v_dim=arg_p.dimension,
            perplexity=arg_p.perplexity,
            theta=arg_p.theta,
            pca_dims=arg_p.pca_dims)
        utils.save_snapshot(embeddings, X_labels, X_image_ids, highdim_vectors)

    # generating one file per no_cluster and some metrics such as the lower bound of the accuracy and cosine distance.
    for no_cluster in range(10, 40, 1):
        print('__________________')
        assignments, c_centers, c_labels = utils.get_clusters(embeddings, no_cluster, X_labels)
        utils.print_metrics(assignments, X_labels, c_labels, highdim_vectors, arg_p.dimension)
        output_filename = arg_p.output
        if no_cluster != DEFAULT_NO_CLUSTERS:
            output_filename += '.' + str(no_cluster)
        utils.convert_to_json(embeddings, assignments, c_centers, c_labels, X_image_ids, filename=output_filename)
    print('Program took {0:.2f} seconds to execute.'.format(time.time() - start_time))
