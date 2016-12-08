const smokesignals = require('smokesignals')
const Testpack = require('./testpack')

module.exports = {
  api: {

  },
  config: {
    main: {
      paths: {
        root: __dirname
      },
      packs: [
        Testpack
      ]
    },
    log: {
      logger: new smokesignals.Logger('silent')
    }
  },
  pkg: {

  }
}
