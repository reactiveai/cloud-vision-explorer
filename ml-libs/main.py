from __future__ import print_function
from collections import Counter
from clustering import kmeans
from tsne import low_dim_mapper
from util import json_utils
from argparse import ArgumentParser
from sys import argv

NO_CLUSTERS = 10
INPUT_FILENAME = 'input.json'
OUTPUT_FILENAME = 'output.json'


def arg_parse():
    arg_parse = ArgumentParser('Google Vision API visualizer')
    arg_parse.add_argument('-i', '--input', type=str,
                           default=INPUT_FILENAME)
    arg_parse.add_argument('-o', '--output', type=str,
                           default=OUTPUT_FILENAME)
    arg_parse.add_argument('-c', '--no_clusters', type=int,
                           default=NO_CLUSTERS)
    return arg_parse

arg_p = arg_parse().parse_args(argv[1:])

print("[Main] input filename is", arg_p.input)
print("[Main] output filename is", arg_p.output)
print("[Main] number of clusters is", arg_p.no_clusters)

[X_vectors, X_labels, X_image_ids] = low_dim_mapper.generate_vectors(json_input_filename=arg_p.input, dim=3)
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
