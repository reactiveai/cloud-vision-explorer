from __future__ import print_function

import numpy as np

# cache
W2V = None


def linear_combination_vectors(vectors, coefficients):
    return np.sum(vectors * np.reshape(coefficients, (-1, 1)), axis=0) / np.sum(coefficients)


def get_glove_handler(dim=200):
    global W2V
    if W2V is None:
        W2V = _load_glove(dim)
    return W2V


def _load_glove(dim):
    word2vec = {}
    print('[Word2vec] loading glove with', dim, 'dimensions')
    with open("data/glove.6B." + str(dim) + "d.txt") as f:
        for line in f:
            l = line.split()
            word2vec[l[0]] = map(float, l[1:])
    return word2vec


def process_word(word, word2vec, silent=False):
    word_vector_size = len(word2vec.iteritems().next()[1])
    if " " in word:
        words = word.split()
        if ''.join(words) in word2vec:  # compound word
            return process_word(''.join(words), word2vec, silent)
        else:
            merged_word2vec = np.zeros(word_vector_size)
            for w in words:
                merged_word2vec += process_word(w, word2vec, silent)
            merged_word2vec /= len(words)
            return merged_word2vec
    if word not in word2vec:
        create_vector(word, word2vec, word_vector_size, silent)
    return np.array(word2vec[word])


def create_vector(word, word2vec, word_vector_size, silent=False):
    vector = np.random.uniform(0.0, 1.0, (word_vector_size,))
    word2vec[word] = vector
    if not silent:
        print("%s is missing" % word)
    return vector