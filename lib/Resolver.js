/**
 * Trails Resolver Class.
 */
module.exports = class TrailsResolver {

  /**
   * Model configuration
   */
  static config () {
  }

  get schema () {
    return this.model.schema
  }

  constructor (model) {
    if (!model) {
      throw new RangeError('Resolver must be given a Model to bind to')
    }
    this.model = model
  }
}

