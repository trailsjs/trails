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
