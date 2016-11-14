const assert = require('assert')
const _ = require('lodash')

describe('i18n', () => {
  it('should expose the __ method on the app object', () => {
    assert(global.app.__)
    assert(_.isFunction(global.app.__))
  })
  describe('#__', () => {
    describe('EN (default)', () => {
      it('should render EN strings by default', () => {
        assert.equal(global.app.__('helloworld'), 'hello world')
      })
      it('should render nested string', () => {
        assert.equal(
          global.app.__('hello.user', { username: 'trails' }),
          'hello trails'
        )
      })
    })
    describe('DE', () => {
      it('should render DE string when specified', () => {
        assert.equal(global.app.__('helloworld', { lng: 'de' }), 'hallo Welt')
      })
      it('should render nested string', () => {
        assert.equal(
          global.app.__('hello.user', { lng: 'de', username: 'trails' }),
          'hallo trails'
        )
      })
    })
  })
})

