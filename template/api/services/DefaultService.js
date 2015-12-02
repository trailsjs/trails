const _ = require('lodash')

/**
 * @module DefaultService
 *
 * @description Default Service included with a new Trails app
 * @see {@link http://trailsjs.io/doc/api/services}
 * @this TrailsApp
 */
module.exports = {

  /**
   * Return some info about this application
   */
  getApplicationInfo () {
    return {
      app: this.pkg.version,
      node: process.version,
      libs: process.versions,
      trailpacks: _.map(_.omit(this.packs, 'inspect'), pack => {
        return {
          name: pack.name,
          version: pack.pkg.version
        }
      })
    }
  }
}
