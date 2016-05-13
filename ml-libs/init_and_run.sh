#!/usr/bin/env bash

#Download Global Vectors for Word Representation. From Stanford University.
if [ ! -f data/glove.6B.50d.txt ]; then
    mkdir data/
    wget http://nlp.stanford.edu/data/glove.6B.zip
    unzip glove.6B.zip
    rm glove.6B.zip
    mv glove.6B* data/
fi

mkdir pickle

echo "input file is 1000 images"
chmod +x main.py 
python main.py
echo "done"
