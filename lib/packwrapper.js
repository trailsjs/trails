'use strict'

module.exports = class PackWrapper {

  constructor (Pack, app) {
    this.app = app
    this.pack = new Pack(app)
  }

  get name () {
    return this.pack.name
  }

  validate (pkg, config, api) {
    if (this.app.config.trailpack.disabled.indexOf(this.pack.name) !== -1) {
      this.app.log.warn(`Refusing to validate trailpack: ${this.pack.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return this.pack.validate(pkg, config, api)
      .then(() => {
        this.app.log.silly(`trailpack:${this.pack.name}:validated`)
        this.app.emit(`trailpack:${this.pack.name}:validated`)
      })
  }

  configure () {
    if (this.app.config.trailpack.disabled.indexOf(this.pack.name) !== -1) {
      this.app.log.warn(`Refusing to configure trailpack: ${this.pack.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return this.pack.configure(arguments)
      .then(() => {
        this.app.log.silly(`trailpack:${this.pack.name}:configured`)
        this.app.emit(`trailpack:${this.pack.name}:configured`)
      })
  }

  initialize () {
    if (this.app.config.trailpack.disabled.indexOf(this.pack.name) !== -1) {
      this.app.log.warn(`Refusing to initialize trailpack: ${this.pack.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return this.pack.initialize(arguments)
      .then(() => {
        this.app.log.silly(`trailpack:${this.pack.name}:initialized`)
        this.app.emit(`trailpack:${this.pack.name}:initialized`)
      })
  }

  inspect () {
    return `
      Trailpack:
        Name            : ${this.pack.name}
        Version         : ${this.pack.pkg.version}
        Description     : ${this.pack.pkg.description}`
  }
}
