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

      assert.throws(() => new lib.Configuration(testConfig), lib.Errors.ValidationError)
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
      assert.equal(config.get('customObject.testValue'), 'test')
    })
    it('should set the value of a new, nested leaf node with no pre-existing path', () => {
      const config = new lib.Configuration(_.cloneDeep(testConfig), { NODE_ENV: 'test' })

      assert(!config.get('foo'))
      config.set('foo.bar.new.path', 'test')

      assert.equal(config.get('foo.bar.new.path'), 'test')
    })
    it('should throw an error when attempting to set a value after frozen', () => {
      const config = new lib.Configuration(_.cloneDeep(testConfig), { NODE_ENV: 'test' })
      config.freeze()

      assert.throws(() => config.set('customObject.string', 'b'), lib.Errors.IllegalAccessError)
      // TODO re-enable
      // assert.throws(() => config.customObject.string = 'c', lib.Errors.IllegalAccessError)
      // assert.throws(() => config.customObject['string'] = 'c', lib.Errors.IllegalAccessError)
    })
  })
  describe('#flattenTree', () => {
    it('test', () => {
      const obj = lib.Configuration.flattenTree({
        main: {
          packs: [
            1,2,3
          ]
        },
        settings: {
          foo: 'bar',
          baz: {
            yes: true
          }
        }
      })

      assert(obj['main.packs.1'])
      assert.equal(obj['settings.foo'], 'bar')
    })
  })
  describe('#merge', () => {
    const tree = {
      foo: true,
      bar: [ 1,2,3 ],
      level2: {
        name: 'alice',
        level3: {
          a: 1
        }
      },
      customObject: {
        string: 'b'
      }
    }
    it('should merge nested tree into configuration', () => {
      const config = new lib.Configuration(testConfig)
      config.merge(tree)

      assert.equal(config.get('level2.level3.a'), 1)
      assert.equal(config.level2.level3.a, 1)
      assert.equal(config.get('customObject.string'), 'b')
      assert.equal(config.get('customObject.int'), 1)
    })
    it('should return list of merged keys', () => {
      const config = new lib.Configuration(testConfig)
      const mergeList = config.merge(tree)

      console.log('mergeList', mergeList)

      assert(mergeList.find(m => m.hasKey && m.key === 'customObject.string'))
    })
  })
})
