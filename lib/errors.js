'use strict'

exports.LoggerNotDefinedError = class extends RangeError {
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
    this.name = 'LoggerNotDefinedError'
  }
}

exports.ApiNotDefinedError = class extends RangeError {
  constructor() {
    super(`
      "api" must be given to the Trails constructor. Application cannot start.
      e.g.
      new TrailsApp({
        pkg: require('./package')
  -->   api: require('./api')
        config: require('./config')
      })

      For more info, see the Trails archetypes:
        - https://git.io/vw845
        - https://git.io/vw84F
      `)
    this.name = 'ApiNotDefinedError'
  }
}

exports.ConfigValueError = class extends RangeError {
  constructor(msg) {
    super(msg)
    this.name = 'ConfigValueError'
  }
}

exports.PackageNotDefinedError = class extends RangeError {
  constructor() {
    super(`
      A "pkg" must be given to the Trails constructor. Application cannot start.
      e.g.
      new TrailsApp({
  -->   pkg: require('./package')
        api: require('./api')
        config: require('./config')
      })

      For more info, see the Trails archetypes:
        - https://git.io/vw845
        - https://git.io/vw84F
      `)
    this.name = 'PackageNotDefinedError'
  }
}
