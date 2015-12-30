'use strict'

const assert = require('assert')
const TrailsApp = require('..')
const Trailpack = require('trailpack')
const lib = require('../lib')
const testAppDefinition = require('./testapp')

describe('lib', () => {
  const app = new TrailsApp(testAppDefinition)

  describe('Trailpack', () => {
    const testTrailpacks = [
      new Trailpack(app, { pkg: { name: 'trailpack-pack1' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack2' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack3' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack4' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-core' }, config: { } })
    ]
    it('#getUserlandTrailpacks', () => {
      const packs = lib.Trailpack.getUserlandTrailpacks(testTrailpacks)

      assert(packs)
      assert.equal(packs.length, 4)
    })
  })
})

