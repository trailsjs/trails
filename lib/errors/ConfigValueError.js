'use strict'

module.exports = class ConfigValueError extends RangeError {
  constructor(msg) {
    super(msg)
  }

  get name () {
    return 'ConfigValueError'
  }
}
