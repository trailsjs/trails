const smokesignals = require('smokesignals')

module.exports = {
  api: {

  },
  config: {
    main: {
      paths: {
        root: __dirname
      }
    },
    log: {
      logger: new smokesignals.Logger('silent')
    }
  },
  pkg: {

  }
}
