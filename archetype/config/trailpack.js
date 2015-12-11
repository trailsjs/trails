/**
 * Trailpack Configuration
 * (app.config.trailpack)
 *
 * @see http://trailsjs.io/doc/config/trailpack
 */
module.exports = {

  disabled: [ ],

  /**
   * Order does *not* matter. Each module is loaded according to its own
   * requirements.
   */
  packs: [
    require('trailpack-core'),
    require('trailpack-repl'),
    require('trailpack-router'),
    require('trailpack-hapi')
  ]
}
