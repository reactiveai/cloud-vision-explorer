#!/usr/bin/env node
'use strict'
const _     = require('lodash')
const util  = require('util')
const glob  = require('glob')
const fs    = require('fs')
const path  = require('path')
const mysql = require('mysql')

const ID_LENGTH = 32

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

_.each(glob.sync(VisionPattern), (file, index, files) => {
  const id = path.basename(file, '.json')
  if(id.length != ID_LENGTH) {
    console.log(`weird! ${file}`)
    pool.end()
    process.exit()
    return
  }

  const vision = fs.readFileSync(file, 'utf8')
  const thumb  = fs.readFileSync(`${ThumbDir}/${id}.jpg`)

  pool.query('REPLACE INTO entries SET ?', {id, vision, thumb}, (err, res) => {
    let count = index + 1
    console.log(`${id} : ${count} / ${files.length}`)
    if(err){
      console.log(err)
      pool.end()
      process.exit()
    }

    if(count == files.length) {
      _.defer(() => {
        pool.end()
        console.log('Done.')
      })
    }
  })
})
