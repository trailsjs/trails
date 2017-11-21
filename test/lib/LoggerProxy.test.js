const assert = require('assert')
const lib = require('../../lib')
const EventEmitter = require('events').EventEmitter

describe('lib.LoggerProxy', () => {
  let emitter, logger
  beforeEach(() => {
    emitter = new EventEmitter()
    emitter.removeAllListeners()
    logger = new lib.LoggerProxy(emitter)
  })

  it('should emit trails:log on invocation of log.info', done => {
    emitter.once('trails:log', () => done())
    logger.info('hello')
  })
  it('should emit trails:log with level=silly on invocation of log.silly', done => {
    emitter.once('trails:log', level => {
      assert.equal(level, 'silly')
      done()
    })
    logger.silly('hello')
  })
  it('should emit trails:log with level=debug on invocation of log.debug', done => {
    emitter.once('trails:log', level => {
      assert.equal(level, 'debug')
      done()
    })
    logger.debug('hello')
  })
  it('should emit trails:log with level=info on invocation of log.info', done => {
    emitter.once('trails:log', level => {
      assert.equal(level, 'info')
      done()
    })
    logger.info('hello')
  })
  it('should emit trails:log with level=warn on invocation of log.warn', done => {
    emitter.once('trails:log', level => {
      assert.equal(level, 'warn')
      done()
    })
    logger.warn('hello')
  })
  it('should emit trails:log with level=error on invocation of log.error', done => {
    emitter.once('trails:log', level => {
      assert.equal(level, 'error')
      done()
    })
    logger.error('hello')
  })
  it('should emit trails:log with correct message on invocation of log.info', done => {
    emitter.once('trails:log', (level, msg) => {
      assert.equal(level, 'info')
      assert.equal(msg.join(' '), 'hello 123')
      done()
    })
    logger.info('hello', '123')
  })
  it('should emit trails:log with correct message and level on invocation of log itself', done => {
    emitter.once('trails:log', (level, msg) => {
      assert.equal(level, 'info')
      assert.equal(msg.join(' '), 'hello 123')
      done()
    })
    logger('info', 'hello', '123')
  })
})

