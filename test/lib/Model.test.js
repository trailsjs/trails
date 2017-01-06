'use strict'

const assert = require('assert')
const { Model, Resolver } = require('../../')

describe('lib/Model', () => {
  describe('sanity', () => {
    it('should exist', () => {
      assert(Model)
    })
    it('can instantiate without error', () => {
      assert(new Model())
    })
  })

  it('#getModelName', () => {
    const TestModel = class TestModel extends Model { }

    assert.equal(new TestModel().getModelName(), 'testmodel')
  })
  describe('#getTableName', () => {
    it('default table name', () => {
      const TestModel = class TestModel extends Model { }
      assert.equal(new TestModel().getTableName(), 'testmodel')
    })
    it('configred table name', () => {
      const TestModel = class TestModel extends Model {
        static config () {
          return {
            tableName: 'customtable'
          }
        }
      }
      assert.equal(new TestModel().getTableName(), 'customtable')
    })
  })
  describe('#schema', () => {
    it('returns nothing by default', () => {
      assert.equal(Model.schema(), undefined)
    })
    it('returns custom schema if set', () => {
      const TestModel = class TestModel extends Model {
        static schema () {
          return {
            columnA: 'string'
          }
        }
      }
      assert.equal(TestModel.schema().columnA, 'string')
    })
  })
  describe('#resolver', () => {
    it('returns nothing by default', () => {
      assert.equal(Model.resolver, Resolver)
    })
    it('returns a Resolver if set', () => {
      const TestModel = class TestModel extends Model {
        static get resolver () {
          return Resolver
        }
      }
      assert.equal(TestModel.resolver, Resolver)
    })
  })
})
