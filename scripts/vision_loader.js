#!/usr/bin/env node
'use strict'
const _      = require('lodash')
const glob   = require('glob')
const fs     = require('fs')
const path   = require('path')
const vision = require('node-cloud-vision-api')

const GCS_BUCKET = 'gcs-samples2-explorer'
const ID_LENGTH = 32
const REQ_INTERVAL = 1000

if(process.argv.length < 4) {
  console.log(`usage  : ${process.argv[1]} <ImagePattern> <VisionDir>`)
  console.log(`example: ${process.argv[1]} "/image/*.jpg" /vision_dir`)
  process.exit()
}

const ImagePattern = process.argv[2]
const VisionDir    = process.argv[3]

const targets = []
_.each(glob.sync(ImagePattern), (file, index, files) => {
  const id = path.basename(file, '.jpg')
  if(id.length != ID_LENGTH) {
    console.log(`weird! ${file}`)
    process.exit()
  }

  try { fs.statSync(`${VisionDir}/${id}.json`) }
  catch(e) { targets.push(id) }
})

const loadVision = (id) => {
  const req = new vision.Request({
    image: new vision.Image({
      url: `https://${GCS_BUCKET}.storage.googleapis.com/image/${id}.jpg`
    }),
    features: [
      new vision.Feature('FACE_DETECTION', 10),
      new vision.Feature('LABEL_DETECTION', 10),
      new vision.Feature('LANDMARK_DETECTION', 10),
      new vision.Feature('LOGO_DETECTION', 10),
      new vision.Feature('TEXT_DETECTION', 10),
      new vision.Feature('SAFE_SEARCH_DETECTION', 10),
      new vision.Feature('IMAGE_PROPERTIES', 10)
    ]
  })

  vision.annotate(req).then((res) => {
    const filePath = `${VisionDir}/${id}.json`
    const data = JSON.stringify(res.responses)
    fs.writeFile(filePath, data, (err) => {
      if(err) {
        console.log(`ERROR : ${id}`)
        return
      }
      console.log(`DONE : ${id}`)
    })
  }, (e) => {
    console.log(e)
    console.log(`ERROR : ${id}`)
  })
}


vision.init({auth: process.env.GOOGLE_API_KEY})
setInterval(() => {
  loadVision(targets.shift())
}, REQ_INTERVAL)
