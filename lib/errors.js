'use strict'

exports.ConfigNotDefinedError = class extends RangeError {
  constructor() {
    super(`
      "config" must be given to the Trails constructor, and it must contain
      an object called "main". Application cannot start.
      e.g.

      const app = new TrailsApp({
        pkg: require('./package'),
        api: require('./api'),
  -->   config: require('./config')
      })

      For more info, see the Trails archetypes:
        - https://git.io/vw845
        - https://git.io/vw84F
    `)
  }
}

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
      "api" must be given to the Trails constructor, or to the start() method.
      Application cannot start.

      e.g.
      1) Send "api" to the constructor
         const app = new TrailsApp({
           pkg: require('./package'),
     -->   api: require('./api'),
           config: require('./config')
         })

      -- OR --

      2) Send "api" to the start() method:
         const app = new TrailsApp({
           pkg: require('./package'),
           config: require('./config')
         })
         app.start({ api: require('./api') })

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
      const app = new TrailsApp({
  -->   pkg: require('./package'),
        api: require('./api'),
        config: require('./config')
      })

      For more info, see the Trails archetypes:
        - https://git.io/vw845
        - https://git.io/vw84F
      `)
    this.name = 'PackageNotDefinedError'
  }
}

exports.IllegalAccessError = class extends Error {
  constructor(msg) {
    super(msg)
    this.name = 'IllegalAccessError'
  }
}

exports.TimeoutError = class extends Error {
  constructor(phase) {
    super(`
      Timeout during "${phase}".
    `)

    this.name = 'TimeoutError'
  }
}
