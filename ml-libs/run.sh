#!/usr/bin/env bash

#Download Global Vectors for Word Representation. From Stanford University.
if [ ! -f data/glove.6B.50d.txt ]; then
    mkdir data/
    wget http://nlp.stanford.edu/data/glove.6B.zip
    unzip glove.6B.zip
    rm glove.6B.zip
    mv glove.6B* data/
fi

wget -nc https://storage.googleapis.com/gcs-samples2-explorer/vision/vision_api_1000.json
wget -nc https://storage.googleapis.com/gcs-samples2-explorer/vision/vision_api_5000.json
wget -nc https://storage.googleapis.com/gcs-samples2-explorer/vision/vision_api_10000.json
echo "input file is 1000 images"
chmod +x main.py 
python main.py -i vision_api_1000.json -o out1000.json
echo "file is output.json"
