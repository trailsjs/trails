'use strict'

module.exports = class LoggerNotDefinedError extends RangeError {
  constructor() {
    super(`
      A logger must be set at config.log.logger. Application cannot start.
      e.g. in config/log.js:

      const winston = require('./winston')
      module.exports = {
        logger: new winston.Logger({
          transports: [
            new winston.transports.Console()
          ]
        })
      }

      For more info, see the config.log archetype: https://git.io/vVvUI
    `)
  }

  get name () {
    return 'LoggerNotDefinedError'
  }
}
