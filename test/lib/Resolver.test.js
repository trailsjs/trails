'use strict'

const assert = require('assert')
const { Resolver, Model } = require('../../')

describe('lib/Resolver', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Resolver)
    })
    it('can instantiate without error', () => {
      assert(new Resolver(new Model()))
    })
  })
  describe('#model getter', () => {

  })
})

