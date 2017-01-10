/*eslint no-console: 0 */
'use strict'

const fs = require('fs')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const lib = require('./')

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

  globals: Object.freeze(Object.assign({
    Service: require('./Service'),
    Controller: require('./Controller'),
    Policy: require('./Policy'),
    Model: require('./Model'),
    Resolver: require('./Resolver')
  }, lib.Errors)),

  globalPropertyOptions: Object.freeze({
    writable: false,
    enumerable: false,
    configurable: false
  }),

  /**
   * Prepare the global namespace with required Trails types. Ignore identical
   * values already present; fail on non-matching values.
   *
   * @throw NamespaceConflictError
   */
  assignGlobals () {
    _.each(lib.Core.globals, (type, name) => {
      if (global[name] === type) return
      if (global[name] && global[name] !== type) {
        throw new lib.Errors.NamespaceConflictError(name, Object.keys(lib.Core.globals))
      }
      const descriptor = Object.assign({ value: type }, lib.Core.globalPropertyOptions)
      Object.defineProperty(global, name, descriptor)
    })
  },

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
    const paths = app.config.get('main.paths')

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
      if (app.config.get('main.freezeConfig') === false) {
        app.log.warn('freezeConfig is disabled. Configuration will not be frozen.')
        app.log.warn('Please only use this flag for testing/debugging purposes.')
      }

      app.freezeConfig()
      app.emit('trails:config:frozen')
    })
    app.once('trailpack:all:initialized', () => {
      app.log.silly(lib.Templates.silly.initialized)
      app.log.info(lib.Templates.info.initialized)
    })
    app.once('trails:ready', () => {
      app.log.info(lib.Templates.info.ready(app))
      app.log.debug(lib.Templates.debug.ready(app))
      app.log.silly(lib.Templates.silly.ready(app))

      app.log.info(lib.Templates.hr)
    })
    app.once('trails:stop', () => {
      app.log.silly(lib.Templates.silly.stop)
      app.log.info(lib.Templates.info.stop)
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
