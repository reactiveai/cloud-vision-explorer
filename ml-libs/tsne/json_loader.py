from __future__ import print_function
import json
import word2vec
JSON_FILENAME = "input.json"


def enrich_map_with_word2vec(label_map, w2v):
    for idx, labels in label_map.iteritems():
        for label in labels:
            desc = label['description']
            vec = word2vec.process_word(desc, w2v, silent=True)
            label['word2vec'] = vec


def generate_label_map():
    with open(JSON_FILENAME) as data_file:
        label_map = {}
        data = json.load(data_file)['responses']
        for idx, record in enumerate(data):
            try:
                label_map[idx] = record['labelAnnotations']
            except KeyError:
                pass
    return label_map


def main():
    w2v = word2vec.load_glove(50)
    label_map = generate_label_map()
    enrich_map_with_word2vec(label_map, w2v)
    return label_map

if __name__ == "__main__":
    main()
