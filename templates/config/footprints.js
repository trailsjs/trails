/**
 * Footprints Configuration
 * (app.config.footprints)
 *
 * Footprints are routes that are auto-generated from your model and controller
 * definitions in api/controllers and api/models.
 *
 * @see http://trailsjs.io/doc/config/footprints
 */
module.exports = {

  /**
   * Generate routes for controller handlers.
   */
  controllers: true,

  /**
   * Generate conventional Create, Read, Update, and Delete (CRUD) routes for
   * each Model.
   */
  models: {
    options: {

      /**
       * The max number of objects to return by default. Can be overridden in
       * the request using the ?limit argument.
       */
      defaultLimit: 100,

      /**
       * Subscribe to changes on requested models via WebSocket
       * (support provided by trailpack-websocket)
       */
      watch: false,

      /**
       * Whether to populate all model associations by default (for "find"
       * and "findOne")
       */
      populate: true
    },

    actions: {
      create: true,
      createWithId: true,
      find: true,
      findOne: true,
      update: true,
      destroy: true,

      /**
       * Specify which "association" endpoints to activate.
       */
      createAssociation: true,
      createAssociationWithId: true,
      findAssociation: true,
      findOneAssociation: true,
      updateAssociation: true,
      destroyAssociation: true
    }
  },

  /**
   * Prefix your footprint routes
   */
  prefix: '/api/v1'
}
