'use strict'

const assert = require('assert')

describe('Trails App', () => {
  it('should boot', () => {
    assert(global.app.started)
    assert(!global.app.stopped)
  })
})
