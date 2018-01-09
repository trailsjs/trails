const Trailpack = require('trailpack')

module.exports = class Testpack extends Trailpack {
  constructor (app) {
    super(app, {
      pkg: {
        name: 'testpack'
      },
      config: {
        testpack: {
          defaultValue: 'default',
          override: 'ko',
          defaultArray: ['ok'],
          defaultArrayWithDuplicates: ['test'],
          defaultObject: {
            test: 'ok',
            override: 'ko'
          }
        }
      }
    })
  }
}
