'use strict'

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

  constructor () {
  }

}
