'use strict'

const assert = require('assert')
const TrailsApp = require('..')
const testAppDefinition = require('./testapp')

describe('Trails', () => {
  describe('@TrailsApp', () => {
    describe('#constructor', () => {
      let app
      before(() => {
        app = new TrailsApp(testAppDefinition)
      })

      it('should be instance of EventEmitter', () => {
        assert(app instanceof require('events').EventEmitter)
      })
      it('should set max number of event listeners', () => {
        assert.equal(app.getMaxListeners(), 64)
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
