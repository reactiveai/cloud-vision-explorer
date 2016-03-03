const rp      = require('request-promise')
const helper  = require('../../helper')

describe('GET /', () => {
  beforeAll((done) => {
    helper.startServer(done)
  })

  afterAll((done) => {
    helper.stopServer(done)
  })

  it('returns something', (done) => {
    rp({
      uri: `${helper.BASE_URL}/`,
      json: false,
      resolveWithFullResponse: true
    })
    .then((res) => {
      expect(res.statusCode).toBe(200)
      done()
    })
    .catch((err) => {
      fail(err)
      done()
    })
  })
})
