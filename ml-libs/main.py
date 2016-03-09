from __future__ import print_function
from clustering import kmeans
from tsne import low_dim_mapper
from util import output_converter

[X, tsne_error] = low_dim_mapper.generate_vectors(dim=3)
[centers, assignments, rss] = kmeans.tf_k_means_cluster(X, no_clusters=10)
output_converter.convert_to_json(X, assignments, filename='output.json')
