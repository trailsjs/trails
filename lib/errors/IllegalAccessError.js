'use strict'

module.exports = class IllegalAccessError extends Error {
  constructor(msg) {
    super(msg)
  }

  get name () {
    return 'IllegalAccessError'
  }
}

