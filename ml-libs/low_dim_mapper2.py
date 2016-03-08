from __future__ import print_function
import json_parser
from scipy.io import savemat
import string
import word2vec
import pickle
import numpy as np

if __name__ == "__main__":
    vecs = []
    label_names = []
    label_map = json_parser.main()
    for label in label_map.values():
        # print("______________")

        label_vectors = []
        label_scores = []
        label_desc = []
        for val in label:  # use scores in a later version.
            label_vectors.append(val['word2vec'])
            label_scores.append(val['score'])
            label_desc.append(str(''.join(c for c in val['description'] if c in string.printable)))
        output_vec = word2vec.linear_combination_vectors(vectors=label_vectors, coefficients=label_scores)
        vecs.append(output_vec)
        label_names.append(label_desc[0] + "+") # otherwise its too big. Plus means we added something

    matlab_dict = dict()
    matlab_dict['data'] = vecs
    matlab_dict['label'] = label_names
    savemat(file_name="tsne.mat", appendmat=False, do_compression=False,oned_as='row', mdict=matlab_dict)

    tsne_python_file = open('tsne_data.dat', 'w')
    pickle.dump(obj=matlab_dict, file=tsne_python_file)

    np.savetxt('tsne_data.txt', vecs)

