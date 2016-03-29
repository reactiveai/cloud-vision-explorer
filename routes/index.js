const express = require('express')
const router  = express.Router()

module.exports = (app) => {
  router.get('/', (req, res) => {
    const error = process.env.GCS_BUCKET_NAME ?
      null : 'ERROR: GCS_BUCKET_NAME variable is required'
    res.render('index', { error, gcsBucketName: process.env.GCS_BUCKET_NAME })
  })

  router.get('/wstest', (req, res) => {
    res.render('wstest', {})
  })

  return router
}
