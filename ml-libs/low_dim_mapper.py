from __future__ import print_function
import json_parser
from scipy.io import savemat
import string

if __name__ == "__main__":
    vecs = []
    label_names = []
    label_map = json_parser.main()
    for label in label_map.values():
        # print("______________")
        for val in label: # use scores in a later version.
            vec = val['word2vec']
            score = val['score']
            desc = str(''.join(c for c in val['description'] if c in string.printable))

            label_names.append(desc)
            vecs.append(vec)

    matlab_dict = dict()
    matlab_dict['data'] = vecs
    matlab_dict['label'] = label_names
    savemat(file_name="tsne.mat", appendmat=False, do_compression=False,oned_as='row', mdict=matlab_dict)
