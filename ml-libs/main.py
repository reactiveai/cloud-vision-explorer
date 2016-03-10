#!/usr/bin/python

from __future__ import print_function

from collections import Counter

from clustering import kmeans
from tsne import low_dim_mapper
from util import utils

no_clusters = 100  # TODO: modify it for better rendering
input_filename = 'input.json'
output_filename = 'output.json'

[X_vectors, X_labels] = low_dim_mapper.generate_vectors(json_input_filename=input_filename, dim=3)
[c_centers, X_assignments, _] = kmeans.tf_k_means_cluster(X_vectors, no_clusters=no_clusters)

labels = []
for i in xrange(no_clusters):
    assignment = X_assignments[i]
    center = c_centers[i]
    indexes = [i for i, x in enumerate(X_assignments) if x == assignment]
    dominant_labels = list(X_labels[i] for i in indexes)
    dominant_label = Counter(dominant_labels).most_common()[0][0]
    labels.append(dominant_label)
    print(assignment, '->', dominant_label, ', center=', center)

utils.convert_to_json(X_vectors, X_assignments, c_centers, labels, filename=output_filename)
