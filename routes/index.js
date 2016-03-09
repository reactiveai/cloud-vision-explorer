const express = require('express')
const router  = express.Router()

module.exports = (app) => {
  // router.get('/', (req, res) => {
  //   res.render('index', {})
  // })

  router.get('/wstest', (req, res) => {
    res.render('wstest', {})
  })

  return router
}
