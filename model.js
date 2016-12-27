'use strict'

/**
 * Trails Model Class.
 */
module.exports = class TrailsModel {

  constructor (app) {
    Object.defineProperty(this, 'app', {
      enumerable: false,
      writable: false,
      value: app
    })
  }

  /**
   * Model configuration
   */
  static config () {
  }

  /**
   * Model schema. The definition of its fields, their types, indexes,
   * foreign keys, etc go here.
   */
  static schema () {
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

  get log () {
    return this.app.log
  }

  get __ () {
    return this.app.__
  }

}
