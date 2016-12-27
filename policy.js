/**
 * Trails Policy Class.
 */
module.exports = class TrailsPolicy {
  constructor(app) {
    Object.defineProperty(this, 'app', {
      enumerable: false,
      writable: false,
      value: app
    })
  }

  /**
   * Policy configuration
   */
  static config() {
  }

  /**
   * Return the id of this policy
   */
  get id () {
    return this.constructor.name.replace(/(\w+)Policy/, '$1').toLowerCase()
  }

  get log() {
    return this.app.log
  }

  get __() {
    return this.app.__
  }
}
