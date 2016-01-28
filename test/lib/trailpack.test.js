'use strict'

const assert = require('assert')
const lib = require('../lib')
const Trailpack = require('trailpack')
const testAppDefinition = require('../testapp')
const TrailsApp = require('../')


describe('Trailpack', () => {
  const app = new TrailsApp(testAppDefinition)

  describe('#getUserlandTrailpacks', () => {
    const testTrailpacks = [
      new Trailpack(app, { pkg: { name: 'trailpack-pack1' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack2' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack3' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack4' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-core' }, config: { } })
    ]

    it('should exclude the core trailpack', () => {
      const packs = lib.Trailpack.getUserlandTrailpacks(testTrailpacks)

      assert(packs)
      assert.equal(packs.length, 4)
    })
  })
  describe('#getTrailpackMapping', () => {
    const testTrailpacks = [
      new Trailpack(app, { pkg: { name: 'trailpack-pack1' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack2' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack3' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-pack4' }, config: { } }),
      new Trailpack(app, { pkg: { name: 'trailpack-core' }, config: { } })
    ]

    it('should index packs by name', () => {
      const packs = lib.Trailpack.getTrailpackMapping(testTrailpacks)

      assert(packs.pack1)
      assert(packs.pack2)
      assert(packs.pack3)
      assert(packs.pack4)
      assert(packs.core)
    })

  })
})

