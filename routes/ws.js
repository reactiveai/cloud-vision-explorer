const _       = require('lodash')
const numeral = require('numeral')

const fetchThumb = (sock, db, ids, fieldName) => {
  return new Promise((resolve, reject) => {
    const queryStr = 'SELECT ?? FROM entries WHERE id IN (?)'
    const columns = [fieldName]
    db.query(queryStr, [columns, ids], (err, rows) => {
      if(err) { return reject(err) }

      const data = _.map(rows, (row) => {
        console.log(`${fieldName} : ${row.id} / ${numeral(row[fieldName].byteLength).format('0.0 b')}`)
        return {
          id: row.id,
          thumb: row[fieldName]
        }
      })

      resolve(data)
    })
  })
}

const onConnection = (sock, db) => {
  console.log('connected')

  _.each(['thumb32', 'thumb64', 'thumb128'], (field) => {
    sock.on(field, (ids) => {
      fetchThumb(sock, db, ids, field)
      .then((data) => { sock.emit(field, data)})
      .catch((err) => { console.log(`ERROR : ${err}]`) })
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
        console.log(`vision : ${row.id} / ${numeral(row.vision.length).format('0.0 b')}`)
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
