from __future__ import print_function

import time

import numpy as np
import tensorflow as tf


def tf_k_means_cluster(vectors, no_clusters=3, no_iterations=100, verbose=False):
    """
    K-Means Clustering using TensorFlow. Thanks to David Andersen.
    :param vectors: should be a n*k 2-D NumPy array, where n is the number
    of vectors of dimensionality k.
    :param no_clusters:  number of clusters. should be an integer.
    :param no_iterations:  number of iterations. should be an integer.
    :param verbose:  True or False.
    :return: clusters
    """
    N = len(vectors)
    dim = len(vectors[0])
    K = no_clusters
    start = time.time()
    data_points = tf.Variable(vectors)
    cluster_assignments = tf.Variable(tf.zeros([N], dtype=tf.int64))

    # Silly initialization:  Use the first two data_points as the starting
    # centroids.  In the real world, do this better.
    centroids = tf.Variable(tf.slice(data_points.initialized_value(), [0, 0], [K, dim]))

    sess = tf.Session()
    sess.run(tf.initialize_all_variables())

    # Replicate to N copies of each centroid and K copies of each
    # point, then subtract and compute the sum of squared distances.
    rep_centroids = tf.reshape(tf.tile(centroids, [N, 1]), [N, K, dim])
    rep_points = tf.reshape(tf.tile(data_points, [1, K]), [N, K, dim])
    sum_squares = tf.reduce_sum(tf.square(rep_points - rep_centroids),
                                reduction_indices=2)

    sum_squares_respective = tf.reduce_min(sum_squares, 1)
    rss = tf.reduce_sum(sum_squares_respective, 0)

    # Use argmin to select the lowest-distance point
    best_centroids = tf.argmin(sum_squares, 1)
    did_assignments_change = tf.reduce_any(tf.not_equal(best_centroids,
                                                        cluster_assignments))

    def bucket_mean(data, bucket_ids, num_buckets):
        total = tf.unsorted_segment_sum(data, bucket_ids, num_buckets)
        count = tf.unsorted_segment_sum(tf.ones_like(data), bucket_ids, num_buckets)
        return total / count

    means = bucket_mean(data_points, best_centroids, K)

    # Do not write to the assigned clusters variable until after
    # computing whether the assignments have changed - hence with_dependencies
    with tf.control_dependencies([did_assignments_change]):
        do_updates = tf.group(
            centroids.assign(means),
            cluster_assignments.assign(best_centroids))

    changed = True
    iterations = 0

    def log(message):
        if verbose:
            print(message)

    while changed and iterations < no_iterations:
        iterations += 1
        [changed, _] = sess.run([did_assignments_change, do_updates])
        log("RSS= {}".format(sess.run(rss)))

    [centers, assignments] = sess.run([centroids, cluster_assignments])
    end = time.time()

    log("Found in {} seconds, {} iterations".format((end - start), iterations))
    log("Centroids: {}".format(centers))
    log("Cluster assignments: {}".format(assignments))

    return centers, assignments, rss


if __name__ == "__main__":
    n = 10000
    k = 30
    vec1 = np.random.rand(n / 2, k) * 0.1  # mean is 0.05
    vec2 = np.random.rand(n / 2, k) * 0.1 + 1  # mean is 1.05
    inputs = np.concatenate((vec1, vec2))

    tf_k_means_cluster(inputs, no_clusters=2, no_iterations=100, verbose=True)
