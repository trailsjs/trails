/**
 * Trails Controller Class.
 */
module.exports = class TrailsController {

  constructor (app) {
    Object.defineProperty(this, 'app', {
      enumerable: false,
      writable: false,
      value: app
    })
  }

  /**
   * Controller configuration
   */
  static config () {
  }

  /**
   * Return the id of this controller
   */
  get id () {
    return this.constructor.name.replace(/(\w+)Controller/, '$1').toLowerCase()
  }

  get log () {
    return this.app.log
  }

  get __ () {
    return this.app.__
  }

  get services () {
    return this.app.services
  }
}
