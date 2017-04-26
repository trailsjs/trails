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
      app.log.info(lib.Templates.docs)
    })
    app.once('trails:stop', () => {
      app.log.info(lib.Templates.info.stop)
      app.config.unfreeze()
    })
    app.once('trails:error:fatal', err => app.stop(err))
  },

  /**
   * Bind lifecycle boundary event listeners. That is, when all trailpacks have
   * completed a particular phase, e.g. "configure" or "initialize", emit an
   * :all:<phase> event.
   */
  bindTrailpackPhaseListeners (app, packs) {
    const validatedEvents = packs.map(pack => `trailpack:${pack.name}:validated`)
    const configuredEvents = packs.map(pack => `trailpack:${pack.name}:configured`)
    const initializedEvents = packs.map(pack => `trailpack:${pack.name}:initialized`)

    app.after(configuredEvents)
      .then(() => app.createPaths())
      .then(() => app.emit('trailpack:all:configured'))
      .catch(err => app.stop(err))

    app.after(validatedEvents)
      .then(() => app.emit('trailpack:all:validated'))
      .catch(err => app.stop(err))

    app.after(initializedEvents)
      .then(() => {
        app.emit('trailpack:all:initialized')
        app.emit('trails:ready')
      })
      .catch(err => app.stop(err))
  },

  /**
   * Bind individual lifecycle method listeners. That is, when each trailpack
   * completes each lifecycle, fire individual events for those trailpacks.
   */
  bindTrailpackMethodListeners (app, pack) {
    const lifecycle = pack.config.lifecycle

    app.after(lifecycle.initialize.listen.concat('trailpack:all:configured'))
      .then(() => app.log.debug('trailpack: initializing', pack.name))
      .then(() => pack.initialize())
      .then(() => app.emit(`trailpack:${pack.name}:initialized`))
      .catch(err => app.stop(err))

    app.after(lifecycle.configure.listen.concat('trailpack:all:validated'))
      .then(() => app.log.debug('trailpack: configuring', pack.name))
      .then(() => pack.configure())
      .then(() => app.emit(`trailpack:${pack.name}:configured`))
      .catch(err => app.stop(err))

    app.after('trails:start')
      .then(() => app.log.debug('trailpack: validating', pack.name))
      .then(() => pack.validate())
      .then(() => app.emit(`trailpack:${pack.name}:validated`))
      .catch(err => app.stop(err))
  },

  /**
   * Unbind all listeners that were bound during application startup
   */
  unbindListeners (app) {
    app.removeAllListeners()
  }
}
