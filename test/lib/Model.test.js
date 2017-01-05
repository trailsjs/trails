'use strict'

const assert = require('assert')
const { Model } = require('../../')

describe('lib/Model', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Model)
    })
    it('can instantiate without error', () => {
      assert(new Model())
    })
  })
})
