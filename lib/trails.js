/*eslint no-console: 0 */
'use strict'

const path = require('path')
const lib = require('.')

module.exports = {

  /**
   * Copy and merge the provided configuration into a new object, decorated with
   * necessary default and environment-specific values.
   */
  buildConfig (config) {
    const configTemplate = {
      main: {
        maxListeners: 128,
        packs: [ ],
        paths: {
          root: path.resolve(path.dirname(require.main.filename)),
          temp: path.resolve(path.dirname(require.main.filename), '.tmp')
        }
      },
      log: { }
    }
    const envConfig = (config && config.env && config.env[process.env.NODE_ENV]) || { }

    // merge config.main.paths
    Object.assign(
      configTemplate.main.paths,
      (config.main && config.main.paths),
      (envConfig.main && envConfig.main.paths)
    )

    // merge config.main
    Object.assign(configTemplate.main, config.main, envConfig.main)

    // merge application log
    Object.assign(configTemplate.log, config.log, envConfig.log)

    // do not merge env config and remove.
    delete config.env

    // merge remaining environment-specific config properties
    return Object.assign({ }, config, envConfig, configTemplate)
  },

  validateConfig (config) {
    if (lib.Trails.hasNestedEnv(config)) {
      console.error('config.env' + process.env.NODE_ENV, 'contains the "env" property')
      throw new lib.Errors.ConfigValidationError()
    }
  },

  hasNestedEnv (config) {
    const env = (config && config.env)
    const nestedEnvs = Object.keys(env).filter(key => {
      return (env[key] || { }).env
    })

    return nestedEnvs.length > 0
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

    lib.Trails.bindApplicationEvents(app)
    app.bound = true
  },

  /**
   * Bind listeners to trails application events
   */
  bindApplicationEvents (app) {
    app.once('trails:error:fatal', err => app.stop(err))
  },

  /**
   * Unbind all listeners that were bound during application startup
   */
  unbindEvents (app) {
    app.removeAllListeners()
    app.bound = false
  }
}
