const assert = require('assert')
const Policy = require('../../lib/Policy')
const Trails = require('../../')
const testApp = require('../integration/testapp')

describe('lib/Policy', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Policy)
      assert(global.Policy)
    })
    it('can instantiate without error', () => {
      assert(new Policy())
    })
  })
  describe('#id', () => {
    it('should return "root" name of Policy', () => {
      const TestPolicy = class TestPolicy extends Policy { }

      assert.equal(new TestPolicy().id, 'test')
    })
  })
  describe('#log', () => {
    it('is a convenience method that simply invokes app.log', done => {
      const app = new Trails(testApp)
      const TestPolicy = class TestPolicy extends Policy { }

      app.once('trails:log', (level, [ msg ]) => {
        assert.equal(level, 'info')
        assert.equal(msg, 'hello from policy')
        done()
      })

      new TestPolicy(app).log('info', 'hello from policy')
    })
  })
})
