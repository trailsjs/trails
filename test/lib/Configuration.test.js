'use strict'

const assert = require('assert')
const lib = require('../../lib')
const smokesignals = require('smokesignals')
const _ = require('lodash')

describe('lib.Configuration', () => {
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
        logger: new smokesignals.Logger('silent'),
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

  describe('#buildConfig', () => {

    it('should merge basic env config', () => {
      const config = lib.Configuration.buildConfig(testConfig, 'envTest1')

      assert(config)
      assert.equal(config.log.merged, 'yes')
      assert.equal(config.log.extraneous, 'assigned')
      assert.equal(config.log.normal, 'yes')
      assert.equal(config.log.nested.merged, 'no')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should merge nested env config', () => {
      process.env.NODE_ENV = 'envTest2'
      const config = lib.Configuration.buildConfig(testConfig, 'envTest2')

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
      const config = lib.Configuration.buildConfig(testConfig, 'envTest3')

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
      const config = lib.Configuration.buildConfig(testConfig, 'envTest1')

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
      const config = lib.Configuration.buildConfig(testConfig, 'envTest2')

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
      const config = lib.Configuration.buildConfig(testConfig, 'envTest2')

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
      const config = lib.Configuration.buildConfig(testConfig, 'notconfigured')

      assert(config)
      assert.equal(config.log.merged, 'no')
      assert.equal(config.log.normal, 'yes')
      assert(!config.log.extraneous)
      assert(config.env)

      assert.equal(config.main.maxListeners, 128)
    })

    it('should keep "env" property from config', () => {
      process.env.NODE_ENV = 'mergetest2'
      const config = lib.Configuration.buildConfig(testConfig, 'mergetest2')
      assert(config.env)
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
      assert.throws(() => lib.Configuration.validateConfig(testConfig), lib.Errors.ConfigValueError)
      assert.throws(() => lib.Configuration.validateConfig(testConfig), /Environment configs/)
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
      assert.throws(() => lib.Configuration.validateConfig(testConfig), lib.Errors.ConfigValueError)
      assert.throws(() => lib.Configuration.validateConfig(testConfig), /config.env/)
    })
    it('should throw ValidationError if main.packs contains an "undefined" trailpack', () => {
      const testConfig = {
        main: {
          packs: [
            undefined
          ]
        },
        log: {
          logger: new smokesignals.Logger('silent')
        }
      }

      assert.throws(() => lib.Configuration.validateConfig(testConfig), lib.Errors.ValidationError)
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

      const nestedEnvs = lib.Configuration.getNestedEnv(testConfig)

      assert.equal(nestedEnvs[0], 'envtest')
      assert.equal(nestedEnvs.length, 1)
    })
  })
  describe('#freezeConfig', () => {
    it('should freeze nested object', () => {
      const o1 = { foo: { bar: 1 } }
      lib.Configuration.freezeConfig(o1, [ ])

      assert(Object.isFrozen(o1))
      assert(Object.isFrozen(o1.foo))
      assert.throws(() => o1.foo = null, Error)
    })
    it('should not freeze exernal modules required from config', () => {
      const o1 = {
        foo: require('smokesignals'),
        bar: 1
      }
      lib.Configuration.freezeConfig(o1, [ require.resolve('smokesignals') ])

      assert.throws(() => o1.bar = null, Error)

      o1.foo.x = 1
      assert.equal(o1.foo.x, 1)
    })

    // https://bugs.chromium.org/p/v8/issues/detail?id=4460
    if (/^(v4)|(v5)/.test(process.version)) {
      it('v8 issue 4460 exists in node v4, v5 series (cannot naively freeze Int8Aray)', () => {
        assert.throws(() => Object.freeze(new Int8Array()), TypeError)
        //assert.throws(() => Object.freeze(new Buffer([1,2,3])), TypeError)
        //assert.throws(() => Object.freeze(new DataView()), TypeError)
      })
    }
    else {
      it('v8 issue 4460 is resolved (node 6 and newer)', () => {
        assert(true)
      })
    }

    it('should freeze objects containing unfreezable types without error', () => {
      const o1 = {
        typedArray: new Int8Array(),
        buffer: new Buffer([ 1,2,3 ]),
        fun: function () { }
      }
      lib.Configuration.freezeConfig(o1, [ ])

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
      lib.Configuration.freezeConfig(app.config, [ ])
      assert.throws(() => app.config.a = 2, Error)

      app.config = lib.Configuration.unfreezeConfig(app.config, [ ])
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
      lib.Configuration.freezeConfig(app.config, [ ])
      assert.throws(() => app.config.main.paths.root = 'newrootpath', Error)

      app.config = lib.Configuration.unfreezeConfig(app.config, [ ])
      app.config.main.paths.root = 'newrootpath'
      assert.equal(app.config.main.paths.root, 'newrootpath')
      assert.equal(app.config.main.paths.temp, 'temppath')
      assert.equal(app.config.main.foo, 1)
    })
  })
  describe('#get', () => {
    it('should return nested config value if it exists', () => {
      const config = new lib.Configuration(testConfig, { NODE_ENV: 'test' })
      assert.equal(config.get('customObject.string'), 'a')
    })
    it('should return undefined if config value does not exist', () => {
      const config = new lib.Configuration(testConfig, { NODE_ENV: 'test' })
      assert.equal(config.get('customObject.nobody'), undefined)
    })
    it('should return undefined if any config tree path segment does not exist', () => {
      const config = new lib.Configuration(testConfig, { NODE_ENV: 'test' })
      assert.equal(config.get('i.dont.exist'), undefined)
    })
    it('should return the nested config object if a path is given to an internal node', () => {
      const config = new lib.Configuration(testConfig, { NODE_ENV: 'test' })
      assert.equal(config.get('customObject').string, 'a')
    })
  })

  describe('#set', () => {
    it('should set the value of a leaf node', () => {
      const config = new lib.Configuration(_.cloneDeep(testConfig), { NODE_ENV: 'test' })
      config.set('customObject.testValue', 'test')

      assert.equal(config.get('customObject.testValue'), 'test')
      assert.equal(config.customObject.testValue, 'test')
    })
    it('should set the value of a new, nested leaf node with no pre-existing path', () => {
      const config = new lib.Configuration(_.cloneDeep(testConfig), { NODE_ENV: 'test' })

      assert(!config.foo)
      config.set('foo.bar.new.path', 'test')

      assert.equal(config.get('foo.bar.new.path'), 'test')
      assert.equal(config.foo.bar.new.path, 'test')
      assert(_.isPlainObject(config.foo))
      assert(_.isPlainObject(config.foo.bar))
      assert(_.isPlainObject(config.foo.bar.new))
    })
  })
})
