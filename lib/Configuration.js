/*eslint no-console: 0 */
'use strict'

const _ = require('lodash')
const path = require('path')
const joi = require('joi')
const schemas = require('./schemas')

module.exports = class Configuration extends Map {
  constructor (configTree, processEnv) {
    super()

    this.immutable = false
    this.env = processEnv
    this.tree = Configuration.buildConfig(configTree, processEnv.NODE_ENV)

    Configuration.validateConfig(this.tree)

    // this looks somewhat strange; I'd like to use a Proxy here, but Node 4
    // does not support it. These properties will be exposed via a Proxy
    // for v3.0 when Node 4 support can be dropped.
    Object.assign(this, this.tree)
  }

  /**
   * @override
   */
  get (key) {
    return _.get(this, key)
  }

  /**
   * @override
   */
  set (key, val) {
    return _.set(this, key, val)
  }

  /**
   * @override
   */
  freeze (modules) {
    this.immutable = true
    this.modules = modules
    Configuration.freezeConfig(this, modules)
  }

  unfreeze () {
    return Configuration.unfreezeConfig(this, this.modules)
  }

  /**
   * Copy and merge the provided configuration into a new object, decorated with
   * necessary default and environment-specific values.
   */
  static buildConfig (initialConfig, nodeEnv) {
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
        },
        freezeConfig: true
      },
      log: { },
      motd: require('./motd')
    }

    const mergedConfig = _.merge(configTemplate, initialConfig, (envConfig || { }))
    mergedConfig.env = nodeEnv

    return mergedConfig
  }

  /**
   * Validate the structure and prerequisites of the configuration object. Throw
   * an Error if invalid; invalid configurations are unrecoverable and require
   * that programmer fix them.
   */
  static validateConfig (config) {
    if (!config || !config.main) {
      throw new ConfigNotDefinedError()
    }

    if (!config.log || !config.log.logger) {
      throw new LoggerNotDefinedError()
    }

    const nestedEnvs = Configuration.getNestedEnv(config)
    if (nestedEnvs.length) {
      throw new ConfigValueError('Environment configs cannot contain an "env" property')
    }

    if (config.env && config.env.env) {
      throw new ConfigValueError('config.env cannot contain an "env" property')
    }

    const result = joi.validate(config, schemas.config)
    if (result.error) {
      console.error(result)
      throw new Error('Project Configuration Error:', result.error)
    }
  }

  /**
   * Check to see if the user defined a property config.env[env].env
   */
  static getNestedEnv (config) {
    const env = (config && config.env)
    const nestedEnvs = Object.keys(env || { }).filter(key => {
      return !!env[key].env
    })

    return nestedEnvs
  }

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
  static freezeConfig (config, modules) {
    _.each(config, (prop, name) => {
      if (!prop || typeof prop !== 'object' || prop.constructor !== Object) {
        return
      }

      const ignoreModule = modules.find(moduleId => require.cache[moduleId].exports === prop)
      if (ignoreModule) {
        return
      }
      Configuration.freezeConfig(prop, modules)
    })

    Object.freeze(config)
  }

  /**
   * Copy the configuration into a normal, unfrozen object
   */
  static unfreezeConfig (config, modules) {
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
    return unfreeze({ }, config)
  }
}
