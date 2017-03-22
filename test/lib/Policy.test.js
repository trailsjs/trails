'use strict'

const assert = require('assert')
const Policy = require('../../lib/Policy')

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
})
