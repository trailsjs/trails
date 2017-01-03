'use strict'

module.exports = class ApiNotDefinedError extends RangeError {
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

  get name () {
    return 'ApiNotDefinedError'
  }
}
