'use strict'

const assert = require('assert')
const Controller = require('../../lib/Controller')

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
})

