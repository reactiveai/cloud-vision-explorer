const _ = require('lodash')
const mysql = require('mysql')

const onConnection = (sock, db) => {
  console.log('connected')

  sock.on('thumbnail', (ids) => {
    const queryStr = 'SELECT id, thumb FROM entries WHERE id IN (?)'
    db.query(queryStr, [ids], (err, rows) => {
      if(err) {
        console.log(err)
        return
      }

      console.log(`returning ${rows.length} thumbnail`)

      sock.emit('thumbnail', _.map(rows, (row) => {
        return {
          id: row['id'],
          thumb: row['thumb']
        }
      }))
    })
  })

  sock.on('vision', (ids) => {
    const queryStr = 'SELECT id, vision FROM entries WHERE id IN (?)'
    db.query(queryStr, [ids], (err, rows) => {
      if(err) {
        console.log(err)
        return
      }

      console.log(`returning ${rows.length} vision`)

      sock.emit('vision', _.map(rows, (row) => {
        return {
          id: row['id'],
          vision: JSON.parse(row['vision'])
        }
      }))
    })
  })
}

module.exports = (app) => {
  app.io.on('connection', (sock) => { onConnection(sock, app.db) })
}
