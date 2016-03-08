#!/usr/bin/env python

import argparse
import os
import json
import logging
import time
from more_itertools import chunked
from logging import getLogger, StreamHandler, INFO

import googleapiclient
from googleapiclient import discovery
from oauth2client.client import GoogleCredentials


class CloudVisionRequester(object):
    DISCOVERY_URL = 'https://{api}.googleapis.com/$discovery/rest?version={apiVersion}'
    GCS_BUCKET = 'gcs-samples2-explorer'
    GCS_IMG_PREFIX = 'image/'
    GCS_IMG_SUFFIX = '.jpg'
    MAX_IMG_BATCH_SIZE = 10
    MAX_API_RETRY = 4
    API_RETRY_DELAY = 5

    def __init__(self, logger):
        self.logger = logger
        credentials = GoogleCredentials.get_application_default()
        self.vision_service = discovery.build(
            'vision', 'v1', credentials=credentials,
            discoveryServiceUrl=self.DISCOVERY_URL)
        self.storage_service = discovery.build(
            'storage', 'v1', credentials=credentials)

    def run(self, options):
        req = self.storage_service.objects().list(
            bucket=self.GCS_BUCKET,
            prefix=self.GCS_IMG_PREFIX,
            fields='nextPageToken,items(name)',
            maxResults=self.MAX_IMG_BATCH_SIZE)

        count = 0
        while req:
            self.logger.info('Now processing %d => %d...' % (
                count + 1, count + self.MAX_IMG_BATCH_SIZE))
            count += self.MAX_IMG_BATCH_SIZE

            resp = req.execute()
            image_paths = self.__get_image_paths(resp)
            self.__handle_vision_api_responses(
                image_paths,
                self.__analyze_images(image_paths),
                options.outdir)

            req = self.storage_service.objects().list_next(req, resp)

    def __get_image_paths(self, storage_response):
        return filter(
            lambda path: path.endswith(self.GCS_IMG_SUFFIX),
            map(lambda item: item['name'], storage_response['items']))

    def __analyze_images(self, image_paths):
        requests = map(lambda path: self.__make_request(path), image_paths)
        req = self.vision_service.images().annotate(body={'requests': requests})

        for i in range(0, self.MAX_API_RETRY + 1):
            try:
                result = req.execute()
                break
            except googleapiclient.errors.HttpError:
                if i < self.MAX_API_RETRY:
                    self.logger.warning('got an error from Vision API so retrying...')
                    time.sleep(self.API_RETRY_DELAY)
                else:
                    self.logger.error('retry limit exceeded')
                    raise

        return result['responses']

    def __handle_vision_api_responses(self, image_paths, responses, out_dir):
        def save_response(image_path, resp):
            name_without_ext = image_path.lstrip(self.GCS_IMG_PREFIX).rstrip(self.GCS_IMG_SUFFIX)
            file = os.path.join(out_dir, name_without_ext + '.json')
            with open(file, 'w') as f:
                json.dump(resp, f)

        for image_path, resp in zip(image_paths, responses):
            if 'error' in resp:
                self.logger.warning('WARN: got an error so skip this. [%s]' % resp['error'])
            else:
                save_response(image_path, resp)

    def __make_request(self, image_path):
        return {
            'image': {
                'source': {
                    'gcsImageUri': 'gs://%s/%s' % (self.GCS_BUCKET, image_path)
                }
            },
            'features': [
                {'type': 'FACE_DETECTION', 'maxResults': 10},
                {'type': 'LANDMARK_DETECTION', 'maxResults': 10},
                {'type': 'LOGO_DETECTION', 'maxResults': 10},
                {'type': 'LABEL_DETECTION', 'maxResults': 10},
                {'type': 'TEXT_DETECTION', 'maxResults': 10},
                {'type': 'SAFE_SEARCH_DETECTION', 'maxResults': 10},
                {'type': 'IMAGE_PROPERTIES', 'maxResults': 10}
            ]
        }

if __name__ == '__main__':
    handler = StreamHandler()
    handler.setLevel(INFO)
    logger = getLogger(__name__)
    logger.setLevel(INFO)
    logger.addHandler(handler)

    parser = argparse.ArgumentParser()
    parser.add_argument(
        'outdir',
        help='A directory to place JSON results from Vision API')

    CloudVisionRequester(logger).run(parser.parse_args())
