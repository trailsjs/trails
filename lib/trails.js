/*eslint no-console: 0 */
'use strict'

const path = require('path')
const merge = require('lodash.merge')
const lib = require('.')

module.exports = {

  /**
   * Copy and merge the provided configuration into a new object, decorated with
   * necessary default and environment-specific values.
   */
  buildConfig (initialConfig, nodeEnv) {
    const root = path.resolve(path.dirname(require.main.filename))
    const temp = path.resolve(root, '.tmp')
    const envConfig = initialConfig.env && initialConfig.env[nodeEnv]

    const configTemplate = {
      main: {
        maxListeners: 128,
        packs: [ ],
        paths: {
          root: root,
          temp: temp,
          sockets: path.resolve(temp, 'sockets'),
          logs: path.resolve(temp, 'log')
        },
        timeouts: {
          start: 10000,
          stop: 10000
        }
      },
      log: { },
      motd: require('./motd')
    }

    return merge(configTemplate, initialConfig, (envConfig || { }))
  },

  /**
   * Validate the structure and prerequisites of the configuration object. Throw
   * an Error if invalid; invalid configurations are unrecoverable and require
   * that programmer fix them.
   */
  validateConfig (config) {
    if (!config || !config.main) {
      throw new lib.Errors.ConfigNotDefinedError()
    }

    if (!config.log || !config.log.logger) {
      throw new lib.Errors.LoggerNotDefinedError()
    }

    const nestedEnvs = lib.Trails.getNestedEnv(config)
    if (nestedEnvs.length) {
      throw new lib.Errors.ConfigValueError('Environment configs cannot contain an "env" property')
    }

    if (config.env && config.env.env) {
      throw new lib.Errors.ConfigValueError('config.env cannot contain an "env" property')
    }


  },

  /**
   * During config object inspection, we need to determine whether an arbitrary
   * object is an external module loaded from a require statement. For example,
   * the config object will contain trailpack modules, and we do not necessarily
   * want to deep freeze all of them. In general, messing directly with loaded
   * modules is not safe.
   */
  getExternalModules () {
    const rootPath = path.resolve(path.dirname(require.main.filename))
    const modulePath = path.join(rootPath, 'node_modules')
    const requiredModules = Object.keys(require.cache).filter(mod => {
      return mod.indexOf(modulePath) >= 0
    })
    return requiredModules
  },


  /**
   * Deep freeze application config object. Exceptions are made for required
   * modules that are listed as dependencies in the application's
   * package definition (package.json). Trails takes a firm stance that
   * configuration should be modified only by the developer, the environment,
   * and the trailpack configuration phase -- never by the application itself
   * during runtime.
   *
   * @param config the configuration object to be frozen.
   * @param [pkg] the package definition to use for exceptions. optional.
   */
  freezeConfig (config, modules) {
    const propNames = Object.getOwnPropertyNames(config)

    propNames.forEach(name => {
      const prop = config[name]

      if (!prop || typeof prop !== 'object' || prop.constructor !== Object) {
        return
      }

      const ignoreModule = modules.find(moduleId => require.cache[moduleId].exports === prop)
      if (ignoreModule) {
        return
      }
      lib.Trails.freezeConfig(prop, modules)
    })

    Object.freeze(config)
  },

  /**
   * Copy the configuration into a normal, unfrozen object
   */
  unfreezeConfig (app, modules) {
    const unfreeze = (target, source) => {
      const propNames = Object.getOwnPropertyNames(source)

      propNames.forEach(name => {
        const prop = source[name]

        if (!prop || typeof prop !== 'object' || prop.constructor !== Object) {
          target[name] = prop
          return
        }

        const ignoreModule = modules.find(moduleId => require.cache[moduleId].exports === prop)
        if (ignoreModule) {
          return
        }

        target[name] = { }
        unfreeze(target[name], prop)
      })

      return target
    }

    Object.defineProperties(app, {
      config: {
        value: unfreeze({ }, app.config),
        configurable: true
      }
    })
  },

  /**
   * Check to see if the user defined a property config.env[env].env
   */
  getNestedEnv (config) {
    const env = (config && config.env)
    const nestedEnvs = Object.keys(env || { }).filter(key => {
      return !!env[key].env
    })

    return nestedEnvs
  },

  /**
   * Bind listeners various application events
   */
  bindListeners (app) {
    if (app.bound) {
      app.log.warn('Someone attempted to bindListeners() twice! Stacktrace below.')
      app.log.warn(console.trace())   // eslint-disable-line no-console
      return
    }

    lib.Trails.bindApplicationListeners(app)
    app.bound = true
  },

  /**
   * Bind listeners to trails application events
   */
  bindApplicationListeners (app) {
    app.once('trailpack:all:configured', () => {
      if (app.config.main.freezeConfig !== false) {
        app.log.warn('freezeConfig is disabled. Configuration will not be frozen.')
        app.log.warn('Please only use this flag for testing/debugging purposes.')
        lib.Trails.freezeConfig(app.config, app.loadedModules)
      }
    })
    app.once('trailpack:all:initialized', () => {
      app.log.silly(app.config.motd.silly.initialized)
      app.log.info(app.config.motd.info.initialized)
    })
    app.once('trails:ready', () => {
      app.log.info(app.config.motd.info.ready(app))
      app.log.debug(app.config.motd.debug.ready(app))
      app.log.silly(app.config.motd.silly.ready(app))

      app.log.info(app.config.motd.hr)
    })
    app.once('trails:stop', () => {
      app.log.silly(app.config.motd.silly.stop)
      app.log.info(app.config.motd.info.stop)
      lib.Trails.unfreezeConfig(app, app.loadedModules)
    })
    app.once('trails:error:fatal', err => app.stop(err))
  },

  /**
   * Unbind all listeners that were bound during application startup
   */
  unbindListeners (app) {
    app.removeAllListeners()
    app.bound = false
  }
}
