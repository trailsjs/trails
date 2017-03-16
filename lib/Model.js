const Resolver = require('./Resolver')

/**
 * Trails Model Class.
 */
module.exports = class TrailsModel {

  /**
   * Model configuration
   */
  static config () {
  }

  /**
   * Model schema. The definition of its fields, their types, indexes,
   * foreign keys, etc go here. Definition will differ based on which
   * ORM/datastore Trailpack is being used.
   */
  static schema () {
  }

  /**
   * The Resolver for this Model. Use Resolvers for resolver-based ORMs such as
   * GraphQL and Falcor. Will typically look something like:
   *    return require('../resolvers/MyModel')
   *
   * Or, you can define the resolver right here, e.g.
   *    return class MyResolver extends Resolver {
   *      findById (...) {
   *        ...
   *      }
   *    }
   */
  static get resolver () {
    return Resolver
  }

  get config () {
    if (!this._config) this._config = this.constructor.config()

    return this._config
  }

  get schema () {
    if (!this._schema) this._schema = this.constructor.config
  }

  set resolver (r) {
    if (this.resolver) {
      throw new IllegalAccessError('Cannot change the resolver on a Model')
    }

    this._resolver = r
  }

  get resolver () {
    return this._resolver
  }

  /**
   * Return the name of this model
   */
  getModelName () {
    return this.constructor.name.toLowerCase()
  }

  /**
   * Return the name of the database table or collection
   */
  getTableName () {
    const config = this.constructor.config() || { }
    return config.tableName || this.getModelName()
  }

  /**
   * Construct the model and bind the Resolver
   */
  constructor () {
    const Resolver = this.constructor.resolver
    this.resolver = new Resolver(this)
  }
}
