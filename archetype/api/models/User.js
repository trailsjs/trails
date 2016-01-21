'use strict'

const Model = require('trails-model')
/**
 * User
 *
 * @description A User model
 */
module.exports = class User extends Model {
  static schema () {
    return {
      username: {
        type: 'string'
      }
    }
  }
}
