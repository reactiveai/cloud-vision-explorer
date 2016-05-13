from __future__ import print_function

import string

from bhtsne import bh_tsne
from util import utils
from util import word2vec


def generate_vectors(json_input_filename, w2v_dim, perplexity, theta, pca_dims, dim=2):
    vectors = []
    most_dominant_labels = []
    image_ids = []
    label_map = utils.load_json(json_input_filename, w2v_dim)
    for image_id, label in label_map.iteritems():
        label_vectors = []
        label_scores = []
        label_desc = []
        for val in label:
            label_vectors.append(val['word2vec'])
            label_scores.append(val['score'])
            label_desc.append(str(''.join(c for c in val['description'] if c in string.printable)))
        output_vec = word2vec.linear_combination_vectors(vectors=label_vectors, coefficients=label_scores)

        vectors.append(output_vec)
        most_dominant_labels.append(label_desc[0])
        image_ids.append(image_id)

    embeddings = []
    for result in bh_tsne(vectors,
                          perplexity=perplexity,
                          initial_dims=pca_dims,
                          theta=theta,
                          no_dims=dim):
        embeddings.append(result)

    embeddings = utils.scale_max_abs(embeddings)
    return embeddings, most_dominant_labels, image_ids
