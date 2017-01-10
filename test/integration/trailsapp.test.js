'use strict'

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const smokesignals = require('smokesignals')
const TrailsApp = require('../..')
const Trailpack = require('trailpack')
const Testpack = require('./testpack')
const testAppDefinition = require('./testapp')
const lib = require('../../lib')

describe('Trails', () => {
  describe('@TrailsApp', () => {
    describe.skip('idempotence', () => {
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

      describe('configuration', () => {
        it('should validate an api object with arbitrary keys', () => {
          assert(global.app.api.customkey)
        })
        it('should create missing directories for configured paths', () => {
          assert(fs.statSync(path.resolve(__dirname, 'testdir')))
        })
        it('should set paths.temp if not configured explicitly by user', () => {
          assert(global.app.config.get('main.paths.temp'))
        })
        it('should set paths.logs if not configured explicitly by user', () => {
          assert(global.app.config.get('main.paths.logs'))
        })
        it('should set paths.sockets if not configured explicitly by user', () => {
          assert(global.app.config.get('main.paths.sockets'))
        })
      })

      describe('errors', () => {
        it('should require "app" argument to constructor', () => {
          assert.throws(() => new TrailsApp(), RangeError)
        })
        describe('@LoggerNotDefinedError', () => {
          it('should throw LoggerNotDefinedError if logger is missing', () => {
            const def = {
              pkg: { },
              api: { },
              config: {
                main: {
                  paths: { root: __dirname }
                }
              }
            }
            assert.throws(() => new TrailsApp(def), lib.Errors.LoggerNotDefinedError)
          })
        })
        describe('@ApiNotDefinedError', () => {
          it('should throw ApiNotDefinedError if no api definition is provided', () => {
            const def = {
              pkg: { },
              config: {
                main: {
                  paths: { root: __dirname }
                },
                log: {
                  logger: new smokesignals.Logger('silent')
                }
              }
            }
            assert.throws(() => new TrailsApp(def), lib.Errors.ApiNotDefinedError)
          })
        })
        describe('@PackageNotDefinedError', () => {
          it('should throw PackageNotDefinedError if no pkg definition is provided', () => {
            const def = {
              config: {
                main: {
                  paths: { root: __dirname }
                },
                log: {
                  logger: new smokesignals.Logger('silent')
                }
              }
            }
            assert.throws(() => new TrailsApp(def), lib.Errors.PackageNotDefinedError)
          })
        })
        describe('@TrailpackError', () => {
          it('should throw PackageNotDefinedError if no pkg definition is provided', () => {
            const def = {
              api: { },
              pkg: { },
              config: {
                main: {
                  packs: [
                    class Failpack extends Trailpack {
                      constructor (app) {
                        super(app)
                      }
                    }
                  ]
                },
                log: {
                  logger: new smokesignals.Logger('silent')
                }
              }
            }
            assert.throws(() => new TrailsApp(def), lib.Errors.TrailpackError)
          })
        })

        it('should cache and freeze process.env', () => {
          process.env.FOO = 'bar'
          const def = {
            api: { },
            config: {
              main: { },
              log: {
                logger: new smokesignals.Logger('silent')
              }
            },
            pkg: { }
          }
          const app = new TrailsApp(def)

          assert.equal(process.env.FOO, 'bar')
          assert.equal(app.env.FOO, 'bar')
          assert.throws(() => app.env.FOO = 1, TypeError)
        })

        it('should freeze config object after trailpacks are loaded', () => {
          const def = {
            pkg: { },
            api: { },
            config: {
              main: {
                packs: [ Testpack ]
              },
              log: { logger: new smokesignals.Logger('debug') },
              foo: 'bar'
            }
          }
          const app = new TrailsApp(def)
          assert.equal(app.config.get('foo'), 'bar')

          return app.start().then(() => {
            assert.equal(app.config.get('foo'), 'bar')
            assert.throws(() => app.config.set('foo', 1), Error)
            return app.stop()
          })
        })

        it('should disallow re-assignment of config object', () => {
          const def = {
            pkg: { },
            api: { },
            config: {
              main: {
                packs: [ Testpack ]
              },
              log: { logger: new smokesignals.Logger('silent') },
              foo: 'bar'
            }
          }
          const app = new TrailsApp(def)
          assert.equal(app.config.get('foo'), 'bar')
          assert.throws(() => app.config = { }, Error)
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
        const eventPromise = app.after('test2')
        app.emit('test2')
        return eventPromise
      })
      it('should invoke listener when listening for multiple events', () => {
        const eventPromise = app.after([ 'test3', 'test4', 'test5' ])
        app.emit('test3')
        app.emit('test4')
        app.emit('test5')

        return eventPromise
      })
      it('should invoke listener when listening for multiple possible events', () => {
        const eventPromise = app.after([['test6', 'test7'], 'test8'])
        app.emit('test6')
        app.emit('test8')

        return eventPromise
      })
      it('should pass event parameters through to handler', () => {
        const eventPromise = app.after(['test9', 'test10'])
          .then(results => {
            assert.equal(results[0], 9)
            assert.equal(results[1], 10)
          })

        app.emit('test9', 9)
        app.emit('test10', 10)

        return eventPromise
      })
      it('should accept a callback as the 2nd argument to invoke instead of returning a Promise', done => {
        app.after(['test11', 'test12'], results => {
          assert.equal(results[0], 11)
          assert.equal(results[1], 12)
          done()
        })
        app.emit('test11', 11)
        app.emit('test12', 12)
      })
    })

    describe('#onceAny', () => {
      let app
      before(() => {
        app = new TrailsApp(testAppDefinition)
      })

      it('should pass event parameters through to handler', () => {
        const eventPromise = app.onceAny('test1')
          .then(result => {
            assert.equal(result[0], 1)
          })

        app.emit('test1', 1)

        return eventPromise
      })
      it('should accept a callback as the 2nd argument to invoke instead of returning a Promise', done => {
        app.onceAny(['test1', 'test2'], t1 => {
          assert.equal(t1, 1)
          done()
        })
        app.emit('test1', 1)
      })
    })
  })
})
