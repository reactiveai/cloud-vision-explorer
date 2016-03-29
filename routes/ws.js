const _       = require('lodash')
const numeral = require('numeral')
const request = require('superagent')

const THUMB_API2DIR = {
  thumb32: '32x32',
  thumb64: '64x64',
  thumb128: '128x128'
}

const getThumbURL = (id, dirName) => {
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/thumbnail/${dirName}/${id}.jpg`
}

const onConnection = (sock) => {
  console.log('connected')

  _.each(THUMB_API2DIR, (dirName, apiName) => {
    sock.on(apiName, (id, cb) => {
      request
      .get(getThumbURL(id, dirName))
      .end((err, res) => {
        if(err) {
          console.log(err)
          return
        }
        console.log(`${apiName} : ${id} / ${numeral(res.body.byteLength).format('0.0 b')}`)
        cb(res.body)
      })
    })
  })
}

module.exports = (app) => {
  app.io.on('connection', onConnection)
}
