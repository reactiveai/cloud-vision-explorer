#!/usr/bin/env node
'use strict'
const _      = require('lodash')
const glob   = require('glob')
const fs     = require('fs')
const path   = require('path')

if(process.argv.length < 3) {
  console.log(`usage  : ${process.argv[1]} <VisionDir>`)
  console.log(`example: ${process.argv[1]} /vision_dir`)
  process.exit()
}

const ID_LENGTH = 32
const VisionDir = process.argv[2]

const consolidated = []

_.each(glob.sync(`${VisionDir}/result/*.json`), (file, index, files) => {
  const id = path.basename(file, '.json')
  if(id.length != ID_LENGTH) {
    console.log(`weird! ${file}`)
    return
  }

  const record = JSON.parse(fs.readFileSync(file, 'utf8'))
  record['imageId'] = id

  consolidated.push(record)
  console.log(`${index + 1} / ${files.length}`)
})

console.log('generating...')
fs.writeFile(`${VisionDir}/vision_api.json`, JSON.stringify(consolidated), (err) => {
  if(err) {
    console.log(err)
    return
  }
  console.log('done')
})
