/*eslint no-console: 0 */
'use strict'

const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const mkdirp = require('mkdirp')

const Core = module.exports = {

  reservedMethods: [
    'app',
    'api',
    'log',
    '__',
    'constructor',
    'undefined',
    'methods',
    'config',
    'schema'
  ],

  /**
   * Bind the context of API resource methods.
   */
  bindMethods (app, resource) {
    return _.mapValues(app.api[resource], (Resource, resourceName) => {
      if (_.isPlainObject(Resource)) {
        throw new Error(`${resourceName} should be a class. It is a regular object`)
      }

      const obj = new Resource(app)

      obj.methods = Core.getClassMethods(obj)
      _.forEach(obj.methods, method => {
        obj[method] = obj[method].bind(obj)
      })
      return obj
    })
  },

  /**
   * Traverse protoype chain and aggregate all class method names
   */
  getClassMethods (obj) {
    const props = [ ]
    const objectRoot = new Object()

    while (!obj.isPrototypeOf(objectRoot)) {
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (props.indexOf(prop) === -1 &&
            !_.includes(Core.reservedMethods, prop) &&
            _.isFunction(obj[prop])) {

          props.push(prop)
        }
      })
      obj = Object.getPrototypeOf(obj)
    }

    return props
  },

  /**
   * Create configured paths if they don't exist
   */
  createDefaultPaths (app) {
    const paths = app.config.main.paths

    return Promise.all(_.map(paths, (dir, pathName) => {
      return new Promise((resolve, reject) => {
        fs.stat(dir, (err, stats) => {
          resolve({ err, stats })
        })
      })
      .then(result => {
        const stats = result.stats

        if (stats && !stats.isDirectory()) {
          app.log.error('The configured path "', pathName, '" is not a directory.')
          app.log.error('config.main.paths should only contain paths to directories')
          return Promise.reject()
        }

        return result
      })
      .then(stat => {
        if (stat.err && /no such file or directory/.test(stat.err.message)) {
          app.log.debug('Trails is creating the path (', pathName, ') at', dir)
        }
        mkdirp.sync(dir)
      })
    }))
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
   * Bind listeners various application events
   */
  bindListeners (app) {
    if (app.bound) {
      app.log.warn('Someone attempted to bindListeners() twice! Stacktrace below.')
      app.log.warn(console.trace())   // eslint-disable-line no-console
      return
    }

    Core.bindApplicationListeners(app)
    app.bound = true
  },

  /**
   * Bind listeners to trails application events
   */
  bindApplicationListeners (app) {
    app.once('trailpack:all:configured', () => {
      if (app.config.main.freezeConfig !== true) {
        app.log.warn('freezeConfig is disabled. Configuration will not be frozen.')
        app.log.warn('Please only use this flag for testing/debugging purposes.')
      }

      app.freezeConfig()
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
      app.unfreezeConfig()
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
