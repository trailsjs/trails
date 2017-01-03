'use strict'

module.exports = class PackageNotDefinedError extends RangeError {
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

  get name () {
    return 'PackageNotDefinedError'
  }
}

