'use strict'

module.exports = class PackWrapper {

  constructor (Pack, app) {
    this.app = app
    this.pack = new Pack(app)
  }

  validate (pkg, config, api) {
    let packName = this.pack.getName()

    if (this.app.config.trailpack.disabled.indexOf(packName) !== -1) {
      this.app.log.debug(`trailpack: ${packName} is disabled in the configuration. Not loading.`)
      return Promise.resolve()
    }

    return this.pack.validate(pkg, config, api)
      .then(() => {
        this.app.log.silly(`trailpack:${packName}:validated`)
        this.app.emit(`trailpack:${packName}:validated`)
      })
  }

  configure () {
    let packName = this.pack.getName()

    if (this.app.config.trailpack.disabled.indexOf(packName) !== -1) {
      return Promise.resolve()
    }

    return this.pack.configure(arguments)
      .then(() => {
        this.app.log.silly(`trailpack:${packName}:configured`)
        this.app.emit(`trailpack:${packName}:configured`)
      })
  }

  initialize () {
    let packName = this.pack.getName()

    if (this.app.config.trailpack.disabled.indexOf(packName) !== -1) {
      return Promise.resolve()
    }

    return this.pack.initialize(arguments)
      .then(() => {
        this.app.log.silly(`trailpack:${packName}:initialized`)
        this.app.emit(`trailpack:${packName}:initialized`)
      })
  }

}
