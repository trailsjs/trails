/*eslint no-console: 0 */

const fs = require('fs')
const mkdirp = require('mkdirp')
const mapValues = require('lodash.mapvalues')
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
    Object.entries(lib.Core.globals).forEach(([name, type]) => {
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
    return mapValues(app.api[resource], (Resource, resourceName) => {
      if (typeof Resource === 'function') {
        throw new Error(`${resourceName} should be a class. It is a regular object`)
      }

      const obj = new Resource(app)

      obj.methods = Core.getClassMethods(obj)
      Object.entries(obj.methods).forEach(([ _, method ])  => {
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
            !Core.reservedMethods.includes(prop) &&
            typeof obj[prop] === 'function') {

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
  async createDefaultPaths (app) {
    const paths = app.config.get('main.paths') || { }

    return Promise.all(Object.entries(paths).map(([ pathName, dir ]) => {
      return new Promise((resolve, reject) => {
        fs.stat(dir, (err, stats) => {
          if (err) {
            if (/no such file or directory/.test(err.message)) {
              app.log.debug('Trails is creating the path (', pathName, ') at', dir)
            }
            else {
              return reject(err)
            }
          }

          mkdirp(dir, err => {
            if (err) return reject(err)

            resolve(stats)
          })
        })
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

      app.config.freeze()
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
      app.log.info(lib.Templates.info.stop)
      app.config.unfreeze()
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
