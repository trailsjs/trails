'use strict'

module.exports = class ConfigValueError extends RangeError {
  constructor(msg) {
    super(ConfigValueError.humanizeMessage(msg))
  }

  get name () {
    return 'ConfigValueError'
  }

  /**
   * TODO
   */
  static humanizeMessage (msg) {
    return msg
  }
}
