#!/usr/bin/env node
'use strict'
const _     = require('lodash')
const util  = require('util')
const glob  = require('glob')
const fs    = require('fs')
const path  = require('path')
const mysql = require('mysql')

const ID_LENGTH = 32

if(process.argv.length < 5) {
  console.log('usage  : load2sql <ImagePathPattern> <ThumbDir> <VisionDir>')
  console.log('example: load2sql "foo/*.jpg" /bar /buz')
  process.exit()
}

const ImagePathPattern = process.argv[2]
const ThumbDir         = process.argv[3]
const VisionDir        = process.argv[4]

const getVisionResult = (id) => {
  const json = fs.readFileSync(`${VisionDir}/${id}.json`, 'utf8')
  return JSON.parse(json)
}

const getThumbnailBuffer = (id) => {
  return fs.readFileSync(`${ThumbDir}/${id}.jpg`)
}

const conn = mysql.createConnection({
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10
})

conn.connect()

_.each(glob.sync(ImagePathPattern), (file) => {
  const id = path.basename(file, '.jpg')
  if(id.length != ID_LENGTH) { return }

  const vision = JSON.stringify(getVisionResult(id))
  const thumb = getThumbnailBuffer(id)

  console.log(id)

  conn.query('REPLACE INTO entries SET ?', {id, vision, thumb}, (err, res) => {
    if(err){ console.log(err) }
  })
})

conn.end()
