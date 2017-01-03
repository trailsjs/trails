'use strict'

module.exports = class TimeoutError extends Error {
  constructor(phase, timeout) {
    super(`
      Timeout during "${phase}". Exceeded configured timeout of ${timeout}ms
    `)
  }

  get name () {
    return 'TimeoutError'
  }
}

