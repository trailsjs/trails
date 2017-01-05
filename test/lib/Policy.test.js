'use strict'

const assert = require('assert')
const { Policy } = require('../../')

describe('lib/Policy', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Policy)
    })
    it('can instantiate without error', () => {
      assert(new Policy())
    })
  })
})
