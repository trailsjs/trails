'use strict'

const TrailsApp = require('trails')

before(() => {
  global.app = new TrailsApp(require('../'))
  return global.app.start().catch(global.app.stop)
})

after(() => {
  return global.app.stop()
})
