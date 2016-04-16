'use strict'

const path = require('path')

const TrailsUtil = module.exports = {

  assignConfigDefaults (config) {
    if (!config) {
      config = { }
    }
    if (!config.env) {
      config.env = { }
    }
    if (!config.env[process.env.NODE_ENV]) {
      config.env[process.env.NODE_ENV] = { }
    }
    if (!config.main) {
      config.main = { }
    }
    if (!config.main.packs) {
      config.main.packs = [ ]
    }
    if (!config.main.paths) {
      config.main.paths = { }
    }
    if (!config.main.maxListeners) {
      config.main.maxListeners = 128
    }
    if (!config.log) {
      config.log = { }
    }

    if (!config.main.paths.root) {
      config.main.paths.root = path.resolve(process.cwd())
    }

    if (!config.main.paths.temp) {
      config.main.paths.temp = path.resolve(process.cwd(), '.tmp')
    }

    return config
  },

  /**
   * Bind listeners various application events
   */
  bindEvents (app) {
    if (app.bound) {
      app.log.warn('Someone attempted to bindEvents() twice! Stacktrace below.')
      app.log.warn(console.trace())   // eslint-disable-line no-console
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
    process.on('exit', app.onExit)
  },

  /**
   * Unbind all listeners that were bound during application startup
   */
  unbindEvents (app) {
    app.removeAllListeners()

    process.removeListener('exit', app.onExit)

    app.bound = false
  }
}
