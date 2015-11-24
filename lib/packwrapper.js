'use strict'

module.exports = class PackWrapper {

  constructor (Pack, app) {
    this.app = app
    this.pack = new Pack(app)
  }

  validate () {
    let packName = this.pack.getName()

    return this.pack.validate(arguments)
      .then(() => {
        this.app.emit(`trailpack:${packName}:validated`)
      })
  }

  configure () {
    let packName = this.pack.getName()

    return this.pack.configure(arguments)
      .then(() => {
        this.app.emit(`trailpack:${packName}:configured`)
      })
  }

  initialize () {
    let packName = this.pack.getName()

    return this.pack.initialize(arguments)
      .then(() => {
        this.app.emit(`trailpack:${packName}:initialized`)
      })
  }

}
