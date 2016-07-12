from __future__ import print_function

import string

from bhtsne import bh_tsne
from util import utils
from util import word2vec


def generate_vectors(json_input_filename, w2v_dim, perplexity, theta, pca_dims):
    highdim_vectors = []
    labels = []
    image_ids = []
    label_map = utils.load_json(json_input_filename, w2v_dim)
    for image_id, label in label_map.iteritems():
        label_vectors = []
        label_scores = []
        label_descriptions = []
        for val in label:
            label_vectors.append(val['word2vec'])
            label_scores.append(val['score'])
            label_descriptions.append(str(''.join(c for c in val['description'] if c in string.printable)))
        highdim_vectors.append(word2vec.linear_combination_vectors(vectors=label_vectors, coefficients=label_scores))
        labels.append(label_descriptions)
        image_ids.append(image_id)

    embeddings = []
    for lowdim_vector in bh_tsne(highdim_vectors,
                                 perplexity=perplexity,
                                 initial_dims=pca_dims,
                                 theta=theta,
                                 no_dims=3):
        embeddings.append(lowdim_vector)

    embeddings = utils.scale_max_abs(embeddings)
    return embeddings, labels, image_ids, highdim_vectors
