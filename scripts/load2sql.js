#!/usr/bin/env node
'use strict'
const _      = require('lodash')
const util   = require('util')
const glob   = require('glob')
const fs     = require('fs')
const path   = require('path')
const mysql  = require('mysql')
const events = require('events')

const eventEmitter = new events.EventEmitter()
const ID_LENGTH = 32
const BATCH_SIZE = 5

if(process.argv.length < 4) {
  console.log('usage  : load2sql <VisionPattern> <ThumbDir>')
  console.log('example: load2sql "./vision_dir/*.json" ./thumb_dir')
  process.exit()
}

const VisionPattern = process.argv[2]
const ThumbDir      = process.argv[3]

const pool = mysql.createPool({
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

const runReplace = (file) => {
  return new Promise((resolve, reject) => {
    const id = path.basename(file, '.json')
    if(id.length != ID_LENGTH) { return reject(file) }

    const thumb32  = fs.readFileSync(`${ThumbDir}/32x32/${id}.jpg`)
    const thumb64  = fs.readFileSync(`${ThumbDir}/64x64/${id}.jpg`)
    const thumb128 = fs.readFileSync(`${ThumbDir}/128x128/${id}.jpg`)

    const dataset = {id, thumb32, thumb64, thumb128, thumb}

    pool.query('REPLACE INTO entries SET ?', dataset, (err, res) => {
      if(err){
        console.log(err)
        return reject(`${id} : ${err}`)
      }
      console.log(id)
      return resolve(id)
    })
  })
}

const files = glob.sync(VisionPattern)
const runner = () => {
  if(_.isEmpty(files)) {
    console.log('done')
    pool.end()
    return
  }

  Promise.all(
    _(files.splice(0, BATCH_SIZE))
    .map((file) => { return runReplace(file) })
    .value()
  )
  .then(() => { eventEmitter.emit('run') })
  .catch((err) => {
    console.log(err)
    pool.end()
  })
}

eventEmitter.on('run', runner)
eventEmitter.emit('run')
