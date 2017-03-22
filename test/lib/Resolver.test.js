'use strict'

const assert = require('assert')
const Model = require('../../lib/Model')
const Resolver = require('../../lib/Resolver')

describe('lib/Resolver', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Resolver)
      assert(global.Resolver)
    })
    it('can instantiate without error', () => {
      assert(new Resolver(new Model()))
    })
  })
  describe('#model getter', () => {

  })
})

