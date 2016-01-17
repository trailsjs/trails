'use strict'
const Model = require('trails-model')

/**
 * @module WebToken
 * @description JWT
 */
module.exports = class WebToken extends Model {
  static config() {
  }

  static schema() {
    return {
      issuer: {
        type: 'string'
      },
      expiration: {
        type: 'datetime'
      },
      scopes: {
        type: 'array'
      },
      subject: {
        type: 'string'
      },
      token: {
        type: 'string'
      }
    }
  }
}

