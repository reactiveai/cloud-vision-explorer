#!/usr/bin/env node
'use strict'
const _     = require('lodash')
const util  = require('util')
const glob  = require('glob')
const fs    = require('fs')
const path  = require('path')

const ID_LENGTH = 32

_.each(glob.sync(`${process.argv[2]}/*.${process.argv[3]}`), (file, index, files) => {
  const id = path.basename(file, `.${process.argv[3]}`)
  if(id.length != ID_LENGTH) { console.log(`${file}`) }
})
