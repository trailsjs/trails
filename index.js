'use strict'

const Trailpack = require('trailpack')

module.exports = class TrailsApp {

  constructor (app) {
    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api

    let Core = this.config.trailpack.core

    if (! Core instanceof Trailpack) {
      throw new Error('Core pack does not extend Trailpack', pack)
    }

  }

  start () {
    let Core = this.config.trailpack.core
    let core = new Core(this)
    let packs = this.config.trailpack.packs.map(Pack => {
      if (! Pack instanceof Trailpack) {
        throw new Error('pack does not extend Trailpack', pack)
      }

      return new Pack(this)
    })

    return core
      .validate(this.pkg, this.config, this.api)
      .then(() => Promise.all(packs.map(pack => pack.validate(this.pkg, this.config, this.api) )))
      .then(() => core.configure())
      .then(() => Promise.all(packs.map(pack => pack.configure() )))
      .then(() => core.initialize())
      .then(() => Promise.all(packs.map(pack => pack.initialize() )))
  }

  stop (code) {
    process.exit(code || 0)
  }
}
