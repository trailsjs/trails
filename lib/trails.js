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
    const envConfig = (config.env && config.env[process.env.NODE_ENV]) || { }

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
      nestedEnvs.forEach(key => {
        console.error('env config [', key ,'] contains the "env" property')
      })
      throw new lib.Errors.ConfigValueError('Environment configs cannot contain an "env" property')
    }

    if (config.env && config.env.env) {
      throw new lib.Errors.ConfigValueError('config.env cannot contain an "env" property')
    }
  },

  /**
   * During config object inspection, we need to determine whether an arbitrary
   * object is an external module loaded from a require() statement. For example,
   * the config object will contain trailpack modules, and we do not necessarily
   * want to deep freeze all of them. In general, messing directly with loaded
   * modules is not safe.
   *
   * We search the require cache against the known dependencies and
   * devDependencies in the package definition (package.json), and look for an
   * identical reference.
   *
   * Return the name of the module if found; false otherwise.
   */
  getExternalModules (pkg) {
    if (!process.moduleLoadList) {
      throw new Error('process.moduleLoadList is not defined.')
    }
    const dependencies = Object.keys(pkg.dependencies || { })
    const devDependencies = Object.keys(pkg.devDependencies || { })
    const nativeModules = process.moduleLoadList
      .filter(id => /^NativeModule /.test(id))
      .filter(id => !(/^NativeModule _/.test(id)))
      .filter(id => !(/\//g.test(id)))
      .map(id => /^NativeModule (\w+)$/.exec(id)[1])

    return nativeModules
      .concat(dependencies)
      .concat(devDependencies)
  },


  /**
   * Deep freeze application config object. Exceptions are made for required
   * modules that are listed as dependencies in the application's
   * package definition (package.json).
   *
   * @param config the configuration object to be frozen.
   * @param [pkg] the package definition to use for exceptions. optional.
   */
  freezeConfig (config, modules) {
    modules || (modules = [ ])
    const propNames = Object.getOwnPropertyNames(config)

    propNames.forEach(name => {
      const prop = config[name]

      if (!prop || typeof prop !== 'object' || prop.constructor !== Object) {
        return
      }

      const ignoreModule = modules.find(moduleId => require(moduleId) === prop)

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
  unfreezeConfig (app) {
    Object.defineProperties(app, {
      config: {
        value: Object.assign({ }, app.config)
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
    app.once('error', err => app.stop(err))
    app.once('trailpack:all:configured', () => lib.Trails.freezeConfig(app.config, app.loadedModules))
    app.once('trails:stop', () => lib.Trails.unfreezeConfig(app))
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
