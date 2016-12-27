/**
 * Trails Service Class.
 */
module.exports = class TrailsService {
  constructor (app) {
    Object.defineProperty(this, 'app', {
      enumerable: false,
      writable: false,
      value: app
    })
  }

  get log () {
    return this.app.log
  }

  get __ () {
    return this.app.__
  }

}
