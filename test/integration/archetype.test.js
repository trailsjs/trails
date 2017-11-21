const proxyquire = require('proxyquire').noCallThru()
const assert = require('assert')
const Trails = require('../..')
const archetype = require('../../archetype')

describe('Archetype', () => {
  describe('as module (index.js)', () => {
    let app
    beforeEach(() => app = new Trails(archetype))
    afterEach(() => app.stop())

    it('should fire right up', done => {
      const logHandler = (level, [ msg ]) => {
        if (/Trails Documentation/.test(msg)) {
          app.removeListener('trails:log', logHandler)
          done()
        }
      }
      app.on('trails:log', logHandler)
      app.start()
    })
  })

  describe('as executable (server.js)', () => {
    let app
    before(() => {
      const startPromise = proxyquire('../../archetype/server', { trails: Trails })
      return startPromise.then(instance => app = instance)
    })

    it('should be running', done => {
      const logHandler = (level, [ msg ]) => {
        if (/running/.test(msg)) {
          app.removeListener('trails:log', logHandler)
          done()
        }
      }
      app.on('trails:log', logHandler)
      app.log.info('running')
    })
    it('should have default configs set', () => {
      assert.equal(app.config.get('log.level'), 'info')
    })
  })


})
