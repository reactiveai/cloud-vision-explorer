const express = require('express')
const router  = express.Router()

module.exports = (app) => {
  router.get('/', (req, res) => {
    res.json({message: 'this is API#index'})
  })

  return router
}
