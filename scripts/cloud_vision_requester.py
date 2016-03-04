#!/usr/bin/env python

import os
import json
import base64
import time
from more_itertools import chunked

import googleapiclient
from googleapiclient import discovery
from oauth2client.client import GoogleCredentials


class CloudVisionRequester(object):
    DISCOVERY_URL = 'https://{api}.googleapis.com/$discovery/rest?version={apiVersion}'
    IMG_DIR = os.path.join(os.path.dirname(__file__), 'images')
    OUT_FILE_PATH = os.path.join(os.path.dirname(__file__), 'out.json')
    MAX_IMG_PROCESSING = 20
    MAX_API_RETRY = 4
    API_RETRY_DELAY = 5

    def main(self):
        # authentication
        credentials = GoogleCredentials.get_application_default()
        service = discovery.build(
            'vision', 'v1', credentials=credentials,
            discoveryServiceUrl=self.DISCOVERY_URL)

        count = 0
        responses = []
        for img_names in chunked(os.listdir(self.IMG_DIR), self.MAX_IMG_PROCESSING):
            print 'Now processing %d => %d...' % (
                count * self.MAX_IMG_PROCESSING + 1,
                (count + 1) * self.MAX_IMG_PROCESSING)
            count += 1

            requests = map(
                lambda img_name: self.__make_request(os.path.join(self.IMG_DIR, img_name)),
                img_names)
            service_request = service.images().annotate(body={'requests': requests})

            for i in range(0, self.MAX_API_RETRY + 1):
                try:
                    result = service_request.execute()
                    break
                except googleapiclient.errors.HttpError:
                    if i < self.MAX_API_RETRY:
                        print 'WARN: got an error from Vision API so retrying...'
                        time.sleep(self.API_RETRY_DELAY)
                    else:
                        print 'ERROR: retry limit exceeded'
                        raise

            for response in result['responses']:
                if 'error' in response:
                    print 'WARN: got an error so skip this. [%s]' % response['error']
                else:
                    responses.append(response)

        with open(self.OUT_FILE_PATH, 'w') as f:
            json.dump({'responses': responses}, f)

    def __make_request(self, img_path):
        with open(img_path, 'rb') as image:
            image_content = base64.b64encode(image.read())
            return {
                'image': {'content': image_content.decode('UTF-8')},
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
    CloudVisionRequester().main()
