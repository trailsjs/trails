const assert = require('assert')
const Service = require('../../lib/Service')
const Trails = require('../../')
const testApp = require('../integration/testapp')

describe('lib/Service', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Service)
      assert(global.Service)
    })
    it('can instantiate without error', () => {
      assert(new Service())
    })
  })
  describe('#id', () => {
    it('should return "root" name of Service', () => {
      const TestService = class TestService extends Service { }

      assert.equal(new TestService().id, 'test')
    })
  })
  describe('#log', () => {
    it('is a convenience method that simply invokes app.log', done => {
      const app = new Trails(testApp)
      const TestService = class TestService extends Service { }

      app.once('trails:log', (level, [ msg ]) => {
        assert.equal(level, 'info')
        assert.equal(msg, 'hello from service')
        done()
      })

      new TestService(app).log('info', 'hello from service')
    })
  })
})
