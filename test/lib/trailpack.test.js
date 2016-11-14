'use strict'

const assert = require('assert')
const lib = require('../../lib')
const Trailpack = require('trailpack')
const testAppDefinition = require('../testapp')
const TrailsApp = require('../../')

describe('lib.Trailpack', () => {
  const app = new TrailsApp(testAppDefinition)

  before(() => {
    return app.start(testAppDefinition)
  })

  describe('#getTrailpackMapping', () => {
    let testTrailpacks
    before(() => {
      testTrailpacks = [
        new Trailpack(app, { pkg: { name: 'trailpack-pack1' }, config: { } }),
        new Trailpack(app, { pkg: { name: 'trailpack-pack2' }, config: { } }),
        new Trailpack(app, { pkg: { name: 'trailpack-pack3' }, config: { } }),
        new Trailpack(app, { pkg: { name: 'trailpack-pack4' }, config: { } }),
        new Trailpack(app, { pkg: { name: 'trailpack-core' }, config: { } })
      ]
    })

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

