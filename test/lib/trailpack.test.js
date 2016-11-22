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
  after(() => {
    return app.stop()
  })
})

