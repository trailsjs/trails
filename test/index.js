'use strict'

const assert = require('assert')
const smokesignals = require('smokesignals')
const TrailsApp = require('..')
const testAppDefinition = require('./testapp')
const lib = require('../lib')

describe('Trails', () => {
  describe('@TrailsApp', () => {
    describe('idempotence', () => {
      it('should be able to start and stop many instances in a single node process', () => {
        const cycles = [ ]
        for (let i = 0; i < 10; ++i) {
          cycles.push(new Promise (resolve => {
            const app = new TrailsApp(testAppDefinition)
            app.start(testAppDefinition)
              .then(app => {
                assert.equal(app.started, true)
                resolve(app)
              })
          }))
        }

        return Promise.all(cycles)
          .then(apps => {
            return Promise.all(apps.map(app => {
              return app.stop()
            }))
          })
          .then(apps => {
            apps.map(app => {
              assert.equal(app.stopped, true)
            })
          })
      })
      it('should be able to stop, then start the same app', () => {
        const app = new TrailsApp(testAppDefinition)
        return app.start(testAppDefinition)
          .then(app => {
            assert.equal(app.started, true)
            return app.stop()
          })
          .then(app => {
            assert.equal(app.stopped, true)
            return app.start(testAppDefinition)
          })
          .then(app => {
            assert.equal(app.started, true)
            return app.stop()
          })
      })
    })
    describe('#constructor', () => {
      let app
      before(() => {
        app = new TrailsApp(testAppDefinition)
      })

      describe('typical usage', () => {
        it('should be instance of EventEmitter', () => {
          assert(app instanceof require('events').EventEmitter)
        })
        it('should set max number of event listeners', () => {
          assert.equal(app.getMaxListeners(), 128)
        })
        it('should set app properties', () => {
          assert(app.pkg)
          assert(app.config)
          assert(app.api)
        })
        it('should set NODE_ENV', () => {
          assert.equal(process.env.NODE_ENV, 'development')
        })
      })

      describe('errors', () => {
        it('should throw LoggerNotDefinedError if logger is missing', () => {
          const def = {
            config: {
              main: {
                paths: { root: __dirname }
              }
            }
          }
          assert.throws(() => new TrailsApp(def), lib.Errors.LoggerNotDefinedError)
        })
        it('should throw ApiNotDefinedError if no api definition is provided', () => {
          const def = {
            config: {
              main: {
                paths: { root: __dirname }
              },
              log: {
                logger: { }
              }
            }
          }
          const app = new TrailsApp(def)
          assert.throws(() => app.start(), lib.Errors.ApiNotDefinedError)
        })
      })

      it('should cache and freeze process.env', () => {
        process.env.FOO = 'bar'
        const def = {
          api: { },
          config: {
            log: { logger: { } }
          }
        }
        const app = new TrailsApp(def)

        assert.equal(process.env.FOO, 'bar')
        assert.equal(app.env.FOO, 'bar')
        assert.throws(() => app.env.FOO = 1, TypeError)
      })

      it('should freeze config object after trailpacks are loaded', () => {
        const def = {
          api: { },
          config: {
            log: {
              logger: new smokesignals.Logger('silent')
            },
            foo: 'bar'
          }
        }
        const app = new TrailsApp(def)

        assert.equal(app.config.foo, 'bar')

        return app.start().then(() => {
          assert.equal(app.config.foo, 'bar')
          assert.throws(() => app.config.foo = 1, TypeError)
        })
      })
    })

    describe('#after', () => {
      let app
      before(() => {
        app = new TrailsApp(testAppDefinition)
      })

      it('should invoke listener when listening for a single event', () => {
        const eventPromise = app.after([ 'test1' ])
        app.emit('test1')
        return eventPromise
      })
      it('should accept a single event as an array or a string', () => {
        const eventPromise = app.after('test1')
        app.emit('test1')
        return eventPromise
      })
      it('should invoke listener when listening for multiple events', () => {
        const eventPromise = app.after([ 'test1', 'test2', 'test3' ])
        app.emit('test1')
        app.emit('test2')
        app.emit('test3')

        return eventPromise
      })
    })
  })
})
