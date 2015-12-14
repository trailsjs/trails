'use strict'

module.exports = class PackWrapper {

  constructor (Pack, app) {
    this.app = app
    this.pack = new Pack(app)
  }

  get name () {
    return this.pack.name
  }

  validate () {
    if (this.app.config.trailpack.disabled.indexOf(this.name) !== -1) {
      this.app.log.warn(`Refusing to validate trailpack: ${this.name} is explicitly disabled in the configuration`)
      return Promise.resolve()
    }

    return Promise.resolve()
      .then(() => this.pack.validate())
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

    return this.app.after(this.pack.config.lifecycle.configure.listen)
      .then(() => this.pack.configure())
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

    return this.app.after(this.pack.config.lifecycle.initialize.listen)
      .then(() => this.pack.initialize())
      .then(() => {
        this.app.log.silly(`trailpack:${this.name}:initialized`)
        this.app.emit(`trailpack:${this.name}:initialized`)
      })
  }
}
