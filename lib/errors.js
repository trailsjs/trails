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

  static get name () {
    return 'ConfigNotDefinedError'
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
  }

  static get name () {
    return 'LoggerNotDefinedError'
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
  }

  static get name () {
    return 'ApiNotDefinedError'
  }
}

exports.ConfigValueError = class extends RangeError {
  constructor(msg) {
    super(msg)
  }

  static get name () {
    return 'ConfigValueError'
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
  }

  static get name () {
    return 'PackageNotDefinedError'
  }
}

exports.IllegalAccessError = class extends Error {
  constructor(msg) {
    super(msg)
  }

  static get name () {
    return 'IllegalAccessError'
  }
}

exports.TimeoutError = class extends Error {
  constructor(phase, timeout) {
    super(`
      Timeout during "${phase}". Exceeded configured timeout of ${timeout}ms
    `)
  }

  static get name () {
    return 'TimeoutError'
  }
}

exports.GraphCompletenessError = class extends RangeError {
  constructor (pack, stageName, eventName) {
    super(`
      The trailpack "${pack.name}" cannot load.

      During the "${stageName}" lifecycle stage, "${pack.name}" waits for
      the event "${eventName}". This event will not be emitted for one
      of the following reasons:

        1. The event "${eventName}" is emitted by a another Trailpack
           that, due to its configuration, paradoxically requires that
           "${pack.name}" loaded before it.

        2. The event "${eventName}" is not emitted by any other Trailpack,
           or it is not properly declared in the Trailpack's lifecycle
           config.

      Please check that you have all the Trailpacks correctly installed
      and configured. If you think this is a bug, please file an issue:
      https://github.com/trailsjs/trails/issues.
    `)

  }

  static get name () {
    return 'GraphCompletenessError'
  }
}

exports.NamespaceConflictError = class extends Error {
  constructor (key, globals) {
    super(`
      The extant global variable "${key}" conflicts with the value provided by
      Trails.

      Trails defines the following variables in the global namespace:
      ${globals}
    `)
  }

  static get name () {
    return 'NamespaceConflictError'
  }
}
