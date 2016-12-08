'use strict'

const Trailpack = require('trailpack')

module.exports = class Testpack extends Trailpack {
  constructor (app) {
    super(app, {
      pkg: {
        name: 'testpack'
      }
    })
  }
}
