const TrailsApp = require('..')

before(() => {
  global.app = new TrailsApp(require('./integration/app'))
  return global.app.start()
})
