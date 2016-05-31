'use strict'

const path = require('path')
const assert = require('assert')
const smokesignals = require('smokesignals')
const lib = require('../../lib')

describe('lib.Trails', () => {

  describe('#buildConfig', () => {
    const NODE_ENV = process.env.NODE_ENV
    let testConfig

    beforeEach(() => {
      testConfig = {
        env: {
          envTest1: {
            log: {
              merged: 'yes',
              extraneous: 'assigned'
            }
          },
          envTest2: {
            log: {
              nested: {
                merged: 'yes',
                extraneous: 'assigned'
              },
              merged: 'yes',
              extraneous: 'assigned'
            }
          },
          envTest3: {
            log: {
              nested: {
                merged: 'yes',
                extraneous: 'assigned',
                deeplyNested: {
                  merged: 'yes',
                  extraneous: 'assigned'
                }
              },
              merged: 'yes',
              extraneous: 'assigned'
            }
          }
        },
        log: {
          merged: 'no',
          nested: {
            merged: 'no',
            deeplyNested: {
              merged: 'no'
            }
          },
          normal: 'yes'
        }
      }
    })

    afterEach(() => {
      process.env.NODE_ENV = NODE_ENV
    })

    it('should merge basic env config', () => {
      process.env.NODE_ENV = 'envTest1'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.log.merged, 'yes')
      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.normal, 'yes')
      assert.equal(config.log.nested.merged, 'no')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should merge nested env config', () => {
      process.env.NODE_ENV = 'envTest2'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.log.merged, 'yes')
      assert.equal(config.log.nested.merged, 'yes')

      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.nested.extraneous, 'assigned')
      assert.equal(config.log.normal, 'yes')
      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.normal, 'yes')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should merge deeply nested env config', () => {
      process.env.NODE_ENV = 'envTest3'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.log.merged, 'yes')
      assert.equal(config.log.nested.merged, 'yes')
      assert.equal(config.log.nested.deeplyNested.merged, 'yes')

      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.nested.extraneous, 'assigned')
      assert.equal(config.log.nested.deeplyNested.extraneous, 'assigned')

      assert.equal(config.log.normal, 'yes')
      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.normal, 'yes')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should not override any configs if NODE_ENV matches no env', () => {
      process.env.NODE_ENV = 'notconfigured'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.log.merged, 'no')
      assert.equal(config.log.normal, 'yes')
      assert(!config.log.extraneous)
      assert(config.env)

      assert.equal(config.main.maxListeners, 128)
    })

    it('should keep "env" property from config', () => {
      process.env.NODE_ENV = 'mergetest2'
      const config = lib.Trails.buildConfig(testConfig)
      assert(config.env)
    })
  })

  describe('#getNestedEnv', () => {
    it('should return a list of envs if one contains a "env" property', () => {
      const testConfig = {
        main: { },
        log: {
          logger: new smokesignals.Logger('silent')
        },
        env: {
          envtest: {
            env: {
              invalid: true
            }
          }
        }
      }

      const nestedEnvs = lib.Trails.getNestedEnv(testConfig)

      assert.equal(nestedEnvs[0], 'envtest')
      assert.equal(nestedEnvs.length, 1)
    })
  })

  describe('#validateConfig', () => {
    it('should throw ConfigValueError if an env config contains the "env" property', () => {
      const testConfig = {
        main: { },
        log: {
          logger: new smokesignals.Logger('silent')
        },
        env: {
          envtest: {
            env: 'hello'
          }
        }
      }
      assert.throws(() => lib.Trails.validateConfig(testConfig), lib.Errors.ConfigValueError)
      assert.throws(() => lib.Trails.validateConfig(testConfig), /Environment configs/)
    })
    it('should throw ConfigValueError if config.env contains the "env" property', () => {
      const testConfig = {
        main: { },
        log: {
          logger: new smokesignals.Logger('silent')
        },
        env: {
          env: 'hello'
        }
      }
      assert.throws(() => lib.Trails.validateConfig(testConfig), lib.Errors.ConfigValueError)
      assert.throws(() => lib.Trails.validateConfig(testConfig), /config.env/)
    })
  })

  describe('#freezeConfig', () => {
    it('should freeze nested object', () => {
      const o1 = { foo: { bar: 1 } }
      lib.Trails.freezeConfig(o1, [ ])

      assert.throws(() => o1.foo = null, Error)
    })
    it('should not freeze exernal modules required from config', () => {
      const o1 = {
        foo: require('smokesignals'),
        bar: 1
      }
      lib.Trails.freezeConfig(o1, [ require.resolve('smokesignals') ])

      assert.throws(() => o1.bar = null, Error)

      o1.foo.x = 1
      assert.equal(o1.foo.x, 1)
    })

    // https://bugs.chromium.org/p/v8/issues/detail?id=4460
    if (!/^v6/.test(process.version)) {
      it('v8 issue 4460 exists', () => {
        assert.throws(() => Object.freeze(new Int8Array()), TypeError)
        //assert.throws(() => Object.freeze(new Buffer([1,2,3])), TypeError)
        //assert.throws(() => Object.freeze(new DataView()), TypeError)
      })
    }
    it('should freeze objects containing unfreezable types without error', () => {
      const o1 = {
        typedArray: new Int8Array(),
        buffer: new Buffer([ 1,2,3 ]),
        fun: function () { }
      }
      lib.Trails.freezeConfig(o1, [ ])

      assert(o1.typedArray)
      assert(Buffer.isBuffer(o1.buffer))
      assert(o1.fun)
    })
  })

  describe('#unfreezeConfig', () => {
    it('should unfreeze shallow config object', () => {
      const app = {
        config: {
          a: 1,
          foo: 'bar'
        }
      }
      lib.Trails.freezeConfig(app.config, [ ])
      assert.throws(() => app.config.a = 2, Error)

      lib.Trails.unfreezeConfig(app, [ ])
      app.config.a = 2
      assert.equal(app.config.a, 2)
    })
    it('should unfreeze deep config object', () => {
      const app = {
        config: {
          main: {
            paths: {
              root: 'rootpath',
              temp: 'temppath'
            },
            foo: 1
          }
        }
      }
      lib.Trails.freezeConfig(app.config, [ ])
      assert.throws(() => app.config.main.paths.root = 'newrootpath', Error)

      lib.Trails.unfreezeConfig(app, [ ])
      app.config.main.paths.root = 'newrootpath'
      assert.equal(app.config.main.paths.root, 'newrootpath')
      assert.equal(app.config.main.paths.temp, 'temppath')
      assert.equal(app.config.main.foo, 1)
    })
  })

  describe('#getExternalModules', () => {
    const rmf = require.main.filename

    beforeEach(() => {
      require.main.filename = path.resolve(__dirname, '..', '..', 'index.js')
    })
    afterEach(() => {
      require.main.filename = rmf
    })
    it('should return external modules', () => {
      const modules = lib.Trails.getExternalModules()
      assert(modules.indexOf(require.resolve('mocha')) !== -1)
    })
  })

})

