const rp     = require('request-promise')
const helper = require('../../helper')

describe('GET /api', () => {
  beforeAll((done) => {
    helper.startServer(done)
  })

  afterAll((done) => {
    helper.stopServer(done)
  })

  it('returns something', (done) => {
    rp({uri: `${helper.BASE_URL}/api`, json: true})
    .then((bodyJSON) => {
      expect(bodyJSON).toEqual({message: 'this is API#index'})
      done()
    })
    .catch((err) => {
      fail(err)
      done()
    })
  })
})
