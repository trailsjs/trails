'use strict'

const path = require('path')
const assert = require('assert')
const _ = require('lodash')
const smokesignals = require('smokesignals')
const lib = require('../../lib')

describe('lib.Core', () => {
  describe('#getClassMethods', () => {
    const A = class A {
      foo () { }
    }
    const B = class B extends A {
      bar () { }
    }
    const C = class B extends A {
      bar () { }
      baz () { }
      get getter () {
        return 'getter'
      }
      static staticThing () { }
    }
    it('should return class methods for object', () => {
      const methods = lib.Core.getClassMethods(new A(), A)

      assert.equal(methods.length, 1)
      assert.equal(methods[0], 'foo')
    })
    it('should return class methods for all objects in prototype chain', () => {
      const methods = lib.Core.getClassMethods(new B(), B)

      assert.equal(methods.length, 2)
      assert(_.includes(methods, 'foo'))
      assert(_.includes(methods, 'bar'))
    })
    it('should return only *instance methods* and no other type of thing', () => {
      const methods = lib.Core.getClassMethods(new C(), C)

      assert.equal(methods.length, 3)
      assert(_.includes(methods, 'bar'))
      assert(_.includes(methods, 'foo'))
      assert(_.includes(methods, 'baz'))
    })
  })
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
            },
            customObject: {
              string: 'b',
              int: 2,
              array: [2, 3, 4],
              subobj: {
                attr: 'b'
              }
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
            },
            customObject: {
              subobj: {
                attr: 'b'
              },
              int2: 2
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
        },
        customObject: {
          string: 'a',
          int: 1,
          array: [1, 2, 3],
          subobj: {
            attr: 'a'
          }
        }
      }
    })

    afterEach(() => {
      process.env.NODE_ENV = NODE_ENV
    })

    it('should merge basic env config', () => {
      const config = lib.Core.buildConfig(testConfig, 'envTest1')

      assert(config)
      assert.equal(config.log.merged, 'yes')
      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.normal, 'yes')
      assert.equal(config.log.nested.merged, 'no')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should merge nested env config', () => {
      process.env.NODE_ENV = 'envTest2'
      const config = lib.Core.buildConfig(testConfig, 'envTest2')

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
      const config = lib.Core.buildConfig(testConfig, 'envTest3')

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

    it('should merge full custom env config', () => {
      process.env.NODE_ENV = 'envTest1'
      const config = lib.Core.buildConfig(testConfig, 'envTest1')

      assert(config)
      assert(typeof config.customObject === 'object')
      assert.equal(config.customObject.string, 'b')
      assert.equal(config.customObject.int, 2)
      assert(Array.isArray(config.customObject.array))
      assert.equal(config.customObject.array[0], 2)
      assert(typeof config.customObject.subobj === 'object')
      assert.equal(config.customObject.subobj.attr, 'b')
    })

    it('should merge partial custom env config', () => {
      process.env.NODE_ENV = 'envTest2'
      const config = lib.Core.buildConfig(testConfig, 'envTest2')

      assert(config)
      assert(typeof config.customObject === 'object')
      assert.equal(config.customObject.string, 'a')
      assert.equal(config.customObject.int, 1)
      assert(Array.isArray(config.customObject.array))
      assert.equal(config.customObject.array[0], 1)
      assert(typeof config.customObject.subobj === 'object')
      assert.equal(config.customObject.subobj.attr, 'b')
    })

    it('should merge new custom attr in env config', () => {
      process.env.NODE_ENV = 'envTest2'
      const config = lib.Core.buildConfig(testConfig, 'envTest2')

      assert(config)
      assert(typeof config.customObject === 'object')
      assert.equal(config.customObject.string, 'a')
      assert.equal(config.customObject.int, 1)
      assert(Array.isArray(config.customObject.array))
      assert.equal(config.customObject.array[0], 1)
      assert(typeof config.customObject.subobj === 'object')
      assert.equal(config.customObject.subobj.attr, 'b')
      assert.equal(config.customObject.int2, 2)
    })

    it('should not override any configs if NODE_ENV matches no env', () => {
      process.env.NODE_ENV = 'notconfigured'
      const config = lib.Core.buildConfig(testConfig, 'notconfigured')

      assert(config)
      assert.equal(config.log.merged, 'no')
      assert.equal(config.log.normal, 'yes')
      assert(!config.log.extraneous)
      assert(config.env)

      assert.equal(config.main.maxListeners, 128)
    })

    it('should keep "env" property from config', () => {
      process.env.NODE_ENV = 'mergetest2'
      const config = lib.Core.buildConfig(testConfig, 'mergetest2')
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

      const nestedEnvs = lib.Core.getNestedEnv(testConfig)

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
      assert.throws(() => lib.Core.validateConfig(testConfig), lib.Errors.ConfigValueError)
      assert.throws(() => lib.Core.validateConfig(testConfig), /Environment configs/)
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
      assert.throws(() => lib.Core.validateConfig(testConfig), lib.Errors.ConfigValueError)
      assert.throws(() => lib.Core.validateConfig(testConfig), /config.env/)
    })
  })

  describe('#freezeConfig', () => {
    it('should freeze nested object', () => {
      const o1 = { foo: { bar: 1 } }
      lib.Core.freezeConfig(o1, [ ])

      assert.throws(() => o1.foo = null, Error)
    })
    it('should not freeze exernal modules required from config', () => {
      const o1 = {
        foo: require('smokesignals'),
        bar: 1
      }
      lib.Core.freezeConfig(o1, [ require.resolve('smokesignals') ])

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
      lib.Core.freezeConfig(o1, [ ])

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
      lib.Core.freezeConfig(app.config, [ ])
      assert.throws(() => app.config.a = 2, Error)

      lib.Core.unfreezeConfig(app, [ ])
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
      lib.Core.freezeConfig(app.config, [ ])
      assert.throws(() => app.config.main.paths.root = 'newrootpath', Error)

      lib.Core.unfreezeConfig(app, [ ])
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
      const modules = lib.Core.getExternalModules()
      assert(modules.indexOf(require.resolve('mocha')) !== -1)
    })
  })

})
