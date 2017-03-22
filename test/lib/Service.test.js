'use strict'

const assert = require('assert')
const Service = require('../../lib/Service')

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
})
