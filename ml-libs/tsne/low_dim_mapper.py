from __future__ import print_function

import string

from sklearn_tsne import tsne
from util import utils
from util import word2vec


def generate_vectors(json_input_filename, dim=2):
    vectors = []
    most_dominant_labels = []
    label_map = utils.load_json(json_input_filename)
    for label in label_map.values():
        label_vectors = []
        label_scores = []
        label_desc = []
        for val in label:  # use scores in a later version.
            label_vectors.append(val['word2vec'])
            label_scores.append(val['score'])
            label_desc.append(str(''.join(c for c in val['description'] if c in string.printable)))
        output_vec = word2vec.linear_combination_vectors(vectors=label_vectors, coefficients=label_scores)
        vectors.append(output_vec)
        most_dominant_labels.append(label_desc[0])

    params = dict()
    params['X'] = vectors
    params['n_components'] = dim
    params['n_components_after_pca'] = 40
    params['perplexity'] = 30
    params['early_exaggeration'] = 4.0
    params['learning_rate'] = 1000
    params['n_iter'] = 1000
    params['random_state'] = 0
    params['angle'] = 0.5

    embeddings = tsne(params=params)

    embeddings = utils.scale_max_abs(embeddings)
    return embeddings, most_dominant_labels
