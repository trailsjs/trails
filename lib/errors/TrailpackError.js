'use strict'

module.exports = class TrailpackError extends Error {
  constructor (pack, error, stage) {
    pack || (pack = { constructor: { }})
    super(`
      ${pack.name} trailpack failed in the "${stage}" stage.
      ${error}
    `)
  }

  get name () {
    return 'TrailpackError'
  }
}
