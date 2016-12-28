'use strict'

const assert = require('assert')

describe('lib.Errors', () => {
  it('all Error types should be global', () => {
    assert(global.ConfigNotDefinedError)
    assert(global.LoggerNotDefinedError)
    assert(global.ApiNotDefinedError)
    assert(global.ConfigValueError)
    assert(global.PackageNotDefinedError)
    assert(global.IllegalAccessError)
    assert(global.TimeoutError)
    assert(global.GraphCompletenessError)
    assert(global.NamespaceConflictError)
  })

  describe('ConfigNotDefinedError', () => {
    it('#name', () => {
      const err = new ConfigNotDefinedError()
      assert.equal(err.name, 'ConfigNotDefinedError')
    })
  })
  describe('LoggerNotDefinedError', () => {
    it('#name', () => {
      const err = new LoggerNotDefinedError()
      assert.equal(err.name, 'LoggerNotDefinedError')
    })
  })
  describe('ApiNotDefinedError', () => {
    it('#name', () => {
      const err = new ApiNotDefinedError()
      assert.equal(err.name, 'ApiNotDefinedError')
    })
  })
  describe('ConfigValueError', () => {
    it('#name', () => {
      const err = new ConfigValueError()
      assert.equal(err.name, 'ConfigValueError')
    })
  })
  describe('PackageNotDefinedError', () => {
    it('#name', () => {
      const err = new PackageNotDefinedError()
      assert.equal(err.name, 'PackageNotDefinedError')
    })
  })
  describe('IllegalAccessError', () => {
    it('#name', () => {
      const err = new IllegalAccessError()
      assert.equal(err.name, 'IllegalAccessError')
    })
  })
  describe('TimeoutError', () => {
    it('#name', () => {
      const err = new TimeoutError()
      assert.equal(err.name, 'TimeoutError')
    })
  })
  describe('GraphCompletenessError', () => {
    it('#name', () => {
      const err = new GraphCompletenessError()
      assert.equal(err.name, 'GraphCompletenessError')
    })
  })
  describe('NamespaceConflictError', () => {
    it('#name', () => {
      const err = new NamespaceConflictError()
      assert.equal(err.name, 'NamespaceConflictError')
    })
  })
})

