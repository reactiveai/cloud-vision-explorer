#!/usr/bin/python

from __future__ import print_function

from collections import Counter

from clustering import kmeans
from tsne import low_dim_mapper
from util import utils

no_clusters = 10  # TODO: modify it for better rendering
input_filename = 'input.json'
output_filename = 'output.json'

[X_vectors, X_labels] = low_dim_mapper.generate_vectors(json_input_filename=input_filename, dim=3)
[c_centers, X_assignments, _] = kmeans.tf_k_means_cluster(X_vectors, no_clusters=no_clusters)

labels = []
for cluster_id in xrange(no_clusters):
    data_points_in_cluster_indexes = [i for i, x in enumerate(X_assignments) if x == cluster_id]
    dominant_labels = list(X_labels[data_point_idx] for data_point_idx in data_points_in_cluster_indexes)
    most_common_labels = Counter(dominant_labels).most_common()
    dominant_label = most_common_labels[0][0]
    frequency_dominant_label = most_common_labels[0][1]
    labels.append(dominant_label)
    print(cluster_id, '->', dominant_label, '(', frequency_dominant_label, '), center=', c_centers[cluster_id])

utils.convert_to_json(X_vectors, X_assignments, c_centers, labels, filename=output_filename)
