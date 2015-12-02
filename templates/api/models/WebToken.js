/**
 * @module WebToken
 * @description JWT
 */
module.exports = {
  attributes: {
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

