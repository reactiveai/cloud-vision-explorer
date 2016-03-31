const express = require('express')
const router  = express.Router()

module.exports = (app) => {

  router.get('/wstest', (req, res) => {
    res.render('wstest', {})
  })

  router.get('/*', (req, res) => {
    if (process.env.GCS_BUCKET) {
      res.render('index', { gcsBucketName: process.env.GCS_BUCKET })
    } else {
      res.status(500).send('GCS_BUCKET variable is required')
    }
  })

  return router
}
