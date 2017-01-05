'use strict'

const assert = require('assert')
const { Service } = require('../../')

describe('lib/Service', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Service)
    })
    it('can instantiate without error', () => {
      assert(new Service())
    })
  })
})
