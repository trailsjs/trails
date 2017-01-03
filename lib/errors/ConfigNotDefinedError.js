'use strict'

module.exports = class ConfigNotDefinedError extends RangeError {
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

  get name () {
    return 'ConfigNotDefinedError'
  }
}

