from __future__ import print_function

import numpy as np


def linear_combination_vectors(vectors, coefficients):
    return np.sum(vectors * np.reshape(coefficients, (-1, 1)), axis=0) / np.sum(coefficients)


def load_glove(dim):
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


if __name__ == "__main__":
    vec1 = np.array([1, 1, 1, 1, 1], dtype=float)
    vec2 = np.array([3, 3, 3, 3, 3], dtype=float)
    vec = np.array([vec1, vec2])
    coeff = np.array([2, 4])
    print(linear_combination_vectors(vec, coeff))

    m_dim = 50
    m_silent = False
    m_word2vec = load_glove(m_dim)
    hello_world = process_word("hello world", m_word2vec, m_silent)
    hello = process_word("hello", m_word2vec, m_silent)
    world = process_word("world", m_word2vec, m_silent)
    hello_world2 = (hello + world) / 2
    print(hello_world == hello_world2)

    not_existing_word = process_word("idontknowaboutit", m_word2vec, m_silent)
    print(not_existing_word)
