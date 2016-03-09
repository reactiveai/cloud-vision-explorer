const _       = require('lodash')
const numeral = require('numeral')

const onConnection = (sock, db) => {
  console.log('connected')

  sock.on('thumbnail', (ids) => {
    const queryStr = 'SELECT id, thumb FROM entries WHERE id IN (?)'
    db.query(queryStr, [ids], (err, rows) => {
      if(err) {
        console.log(err)
        return
      }

      sock.emit('thumbnail', _.map(rows, (row) => {
        console.log(`emitting thumbnail : ${row.id} / ${numeral(row.thumb.byteLength).format('0.0 b')}`)
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

      sock.emit('vision', _.map(rows, (row) => {
        console.log(`emitting vision : ${row.id} / ${numeral(row.vision.length).format('0.0 b')}`)
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
