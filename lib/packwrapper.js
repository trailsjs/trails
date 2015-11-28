'use strict'

module.exports = class PackWrapper {

  constructor (Pack, app) {
    this.app = app
    this.pack = new Pack(app)
  }

  get name () {
    return this.name
  }

  validate (pkg, config, api) {
    if (this.app.config.trailpack.disabled.indexOf(this.name) !== -1) {
      this.app.log.warn(`Refusing to validate trailpack: ${this.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return this.pack.validate(pkg, config, api)
      .then(() => {
        this.app.log.silly(`trailpack:${this.name}:validated`)
        this.app.emit(`trailpack:${this.name}:validated`)
      })
  }

  configure () {
    if (this.app.config.trailpack.disabled.indexOf(this.name) !== -1) {
      this.app.log.warn(`Refusing to configure trailpack: ${this.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return this.pack.configure(arguments)
      .then(() => {
        this.app.log.silly(`trailpack:${this.name}:configured`)
        this.app.emit(`trailpack:${this.name}:configured`)
      })
  }

  initialize () {
    if (this.app.config.trailpack.disabled.indexOf(this.name) !== -1) {
      this.app.log.warn(`Refusing to initialize trailpack: ${this.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return this.pack.initialize(arguments)
      .then(() => {
        this.app.log.silly(`trailpack:${this.name}:initialized`)
        this.app.emit(`trailpack:${this.name}:initialized`)
      })
  }

  inspect () {
    return `
      Trailpack:
        Name            : ${this.name}
        Version         : ${this.pack.pkg.version}
        Description     : ${this.pack.pkg.description}`
  }
}
