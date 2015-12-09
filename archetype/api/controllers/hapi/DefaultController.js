/**
 * @module DefaultController
 *
 * @description Default Controller included with a new Trails app
 * @see {@link http://trailsjs.io/doc/api/controllers}
 * @this TrailsApp
 */
module.exports = {

  /**
   * Return some info about this application
   */
  info (request, reply) {
    reply(this.api.services.DefaultService.getApplicationInfo())
  },

  catchAll (request, reply) {
    reply('<h1>This is the wrong trail</h1>');
  }
}
