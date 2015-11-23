const PackLoader = require('packloader')

module.exports = class TrailsApp {

  constructor (app) {
    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api

    let packcfg = this.app.config.trailpack
    let Core = packcfg.core

    if (! Core instanceof Trailpack) {
      throw new Error('Core pack does not extend Trailpack', pack)
    }

  }

  start () {
    let core = new Core(this)
    let packs = this.config.trailpack.packs.map(Pack => {
      if (! Pack instanceof Trailpack) {
        throw new Error('pack does not extend Trailpack', pack)
      }

      return new Pack(this)
    })

    return core
      .validate()
      .then(() => Promise.all(packs.map(pack => pack.validate() )))
      .then(() => core.configure())
      .then(() => Promise.all(packs.map(pack => pack.configure() )))
      .then(() => core.initialize())
      .then(() => Promise.all(packs.map(pack => pack.initialize() )))
  }

  stop (code) {
    process.exit(code || 0)
  }
}
