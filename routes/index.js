const express = require('express')
const router  = express.Router()

module.exports = (app) => {
  const renderIndex = (req, res) => {
    if (process.env.GCS_BUCKET_NAME) {
      res.render('index', { gcsBucketName: process.env.GCS_BUCKET_NAME })
    } else {
      res.status(500).send('GCS_BUCKET_NAME variable is required')
    }
  }

  router.get('/', renderIndex)
  router.get('/galaxy', renderIndex)

  router.get('/wstest', (req, res) => {
    res.render('wstest', {})
  })

  return router
}
