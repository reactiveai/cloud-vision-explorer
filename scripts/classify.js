#!/usr/bin/env node
'use strict'
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate'

const images = fs.readFileSync('files.txt').toString().split('\n')
const requests = _.map(images, (imagePath) => {
  const requestBody = {
    image: {
      source: {
        gcs_image_uri: imagePath
      }
    },
    features: [
      {type: 'LABEL_DETECTION', maxResults: 10},
      {type: 'FACE_DETECTION', maxResults: 10},
      {type: 'LANDMARK_DETECTION', maxResults: 10},
      {type: 'LOGO_DETECTION', maxResults: 10},
      {type: 'TEXT_DETECTION', maxResults: 10},
      {type: 'SAFE_SEARCH_DETECTION', maxResults: 10},
      {type: 'IMAGE_PROPERTIES', maxResults: 10}
    ]
  }

  return ((cb) => {
    axios({
      method: 'post',
      url: VISION_API_ENDPOINT,
      params: {key: process.env.GOOGLE_API_KEY},
      data: {requests: requestBody}
    })
    .then((res) => {
      const baseName = path.basename(imagePath, '.jpg')
      fs.writeFileSync(`results/${baseName}.json`, JSON.stringify(res.data.responses, null, 2))
      console.log(imagePath)
    })
    .catch(console.error)
  })
})


const timerId = setInterval(() => {
  if(_.isEmpty(requests)){
    clearInterval(timerId)
    return
  }

  requests.pop()()
}, 1000)
