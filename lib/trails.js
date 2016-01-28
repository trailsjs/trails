/*eslint no-console: 0 */
'use strict'

const TrailsUtil = module.exports = {

  assignConfigDefaults (config) {
    if (!config.env) {
      config.env = { }
    }
    if (!config.env[process.env.NODE_ENV]) {
      config.env[process.env.NODE_ENV] = { }
    }
    if (!config.main.paths) {
      config.main.paths = { }
    }
    if (!config.main.paths.root) {
      config.main.paths.root = process.cwd()
    }

  },

  /**
   * Bind listeners various application events
   */
  bindEvents (app) {
    if (app.bound) {
      app.log.warn('Someone attempted to bindEvents() twice! Stacktrace below.')
      app.log.warn(console.trace())
      return
    }

    TrailsUtil.bindApplicationEvents(app)
    TrailsUtil.bindSystemEvents(app)

    app.bound = true
  },

  /**
   * Bind listeners to trails application events
   */
  bindApplicationEvents (app) {
    app.once('trails:error:fatal', err => app.stop(err))
  },

  /**
   * Bind listeners to node system events
   */
  bindSystemEvents (app) {
    process
      .on('exit', () => {
        app.log.verbose('Event loop is empty. Shutting down')
      })
      .on('uncaughtException', err => {
        app.log.error('uncaughtException', err)
        console.trace()

        app.stop(err)
      })
  },

  /**
   * Unbind all listeners that were bound during application startup
   */
  unbindEvents (app) {
    app.removeAllListeners()

    process.removeAllListeners('exit')
    process.removeAllListeners('uncaughtException')

    app.bound = false
  }
}

