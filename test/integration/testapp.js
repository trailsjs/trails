const smokesignals = require('smokesignals')
const Trailpack = require('trailpack')

module.exports = {
  api: {

  },
  config: {
    main: {
      paths: {
        root: __dirname
      },
      packs: [
        Trailpack
      ]
    },
    log: {
      logger: new smokesignals.Logger('silent')
    }
  },
  pkg: {

  }
}
