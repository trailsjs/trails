const assert = require('assert')
const Controller = require('../../lib/Controller')
const Trails = require('../../')
const testApp = require('../integration/testapp')

describe('lib/Controller', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Controller)
      assert(global.Controller)
    })
    it('can instantiate without error', () => {
      assert(new Controller())
    })
  })
  describe('#id', () => {
    it('should return "root" name of Controller', () => {
      const TestController = class TestController extends Controller { }

      assert.equal(new TestController().id, 'test')
    })
  })
  describe('#log', () => {
    it('is a convenience method that simply invokes app.log', done => {
      const app = new Trails(testApp)
      const TestController = class TestController extends Controller { }

      app.once('trails:log', (level, [ msg ]) => {
        assert.equal(level, 'info')
        assert.equal(msg, 'hello from controller')
        done()
      })

      new TestController(app).log('info', 'hello from controller')
    })
  })
})

