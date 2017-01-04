/*eslint no-console: 0 */
'use strict'

const EventEmitter = require('events').EventEmitter
const lib = require('./lib')
const i18next = require('i18next')
const NOOP = function () { }

// inject Error and Resource types into the global namespace
lib.Core.assignGlobals()

/**
 * The Trails Application. Merges the configuration and API resources
 * loads Trailpacks, initializes logging and event listeners.
 */
module.exports = class TrailsApp extends EventEmitter {

  /**
   * @param pkg The application package.json
   * @param app.api The application api (api/ folder)
   * @param app.config The application configuration (config/ folder)
   *
   * Initialize the Trails Application and its EventEmitter parentclass. Set
   * some necessary default configuration.
   */
  constructor (app) {
    super()

    if (!app) {
      throw new RangeError('No app definition provided to Trails constructor')
    }
    if (!app.pkg) {
      throw new lib.Errors.PackageNotDefinedError()
    }
    if (!app.api) {
      throw new lib.Errors.ApiNotDefinedError()
    }

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }

    const processEnv = Object.freeze(JSON.parse(JSON.stringify(process.env)))

    Object.defineProperties(this, {
      env: {
        enumerable: false,
        value: processEnv
      },
      pkg: {
        enumerable: false,
        value: app.pkg
      },
      versions: {
        enumerable: false,
        writable: false,
        configurable: false,
        value: process.versions
      },
      config: {
        value: new lib.Configuration(app.config, processEnv),
        configurable: true,
        writable: false
      },
      api: {
        value: app.api,
        writable: true,
        configurable: true
      },
      _trails: {
        enumerable: false,
        value: require('./package')
      },
      packs: {
        value: { }
      },
      loadedPacks: {
        enumerable: false,
        writable: true,
        value: [ ]
      },
      loadedModules: {
        enumerable: false,
        value: lib.Core.getExternalModules(this.pkg)
      },
      bound: {
        enumerable: false,
        writable: true,
        value: false
      },
      started: {
        enumerable: false,
        writable: true,
        value: false
      },
      stopped: {
        enumerable: false,
        writable: true,
        value: false
      },
      timers: {
        enumerable: false,
        writable: true,
        value: { }
      },
      models: {
        enumerable: true,
        writable: false,
        value: { }
      },
      services: {
        enumerable: true,
        writable: false,
        value: { }
      },
      controllers: {
        enumerable: true,
        writable: false,
        value: { }
      },
      policies: {
        enumerable: true,
        writable: false,
        value: { }
      },
      translate: {
        enumerable: false,
        writable: true
      }
    })

    this.setMaxListeners(this.config.main.maxListeners)

    // instantiate trailpacks
    this.config.main.packs.forEach(Pack => {
      try {
        new Pack(this)
      }
      catch (e) {
        throw new TrailpackError(Pack, e, 'constructor')
      }
    })
    this.loadedPacks = Object.keys(this.packs).map(name => this.packs[name])

    // bind resource methods
    Object.assign(this.models, lib.Core.bindMethods(this, 'models'))
    Object.assign(this.services, lib.Core.bindMethods(this, 'services'))
    Object.assign(this.controllers, lib.Core.bindMethods(this, 'controllers'))
    Object.assign(this.policies, lib.Core.bindMethods(this, 'policies'))
  }

  /**
   * Start the App. Load all Trailpacks.
   *
   * @return Promise
   */
  start () {
    lib.Core.bindListeners(this)
    lib.Trailpack.bindTrailpackPhaseListeners(this, this.loadedPacks)
    lib.Trailpack.bindTrailpackMethodListeners(this, this.loadedPacks)

    // initialize i18n
    i18next.init(this.config.i18n, (err, t) => {
      if (err) {
        throw new Error(`Problem loading i18n: ${err}`)
      }

      this.translate = t
      this.emit('trails:start')
    })

    return this.after('trails:ready')
      .then(() => {
        this.started = true
        return this
      })
  }

  /**
   * Shutdown. Unbind listeners, unload trailpacks.
   * @return Promise
   */
  stop (err) {
    this.stopped = true
    if (err) {
      this.log.error('\n', err.stack || '')
    }
    if (!this.started) {
      this.log.error('The application did not boot successfully.')
      this.log.error('Try increasing the loglevel to "debug" to learn more')
    }

    this.emit('trails:stop')
    lib.Core.unbindListeners(this)

    return Promise.all(
      this.loadedPacks.map(pack => {
        this.log.debug('Unloading trailpack', pack.name, '...')
        return pack.unload()
      }))
      .then(() => {
        this.log.debug('All trailpacks unloaded. Done.')
        return this
      })
      .catch(err => {
        console.error(err)
        return this
      })
  }

  /**
   * @override
   * Log app events for debugging
   */
  emit (event) {
    this.log.debug('trails event:', event)
    return super.emit.apply(this, arguments)
  }

  /**
   * Resolve Promise once ANY of the events in the list have emitted. Also
   * accepts a callback.
   * @return Promise
   */
  onceAny (events, handler) {
    handler || (handler = NOOP)
    if (!Array.isArray(events)) {
      events = [events]
    }

    let resolveCallback
    const handlerWrapper = function () {
      handler.apply(null, arguments)
      return arguments
    }

    return Promise.race(events.map(eventName => {
      return new Promise(resolve => {
        resolveCallback = resolve
        this.once(eventName, resolveCallback)
      })
    }))
    .then(handlerWrapper)
    .then(args => {
      events.forEach(eventName => this.removeListener(eventName, resolveCallback))
      return args
    })
  }

  /**
   * Resolve Promise once all events in the list have emitted. Also accepts
   * a callback.
   * @return Promise
   */
  after (events, handler) {
    handler || (handler = NOOP)
    if (!Array.isArray(events)) {
      events = [ events ]
    }

    const handlerWrapper = (args) => {
      handler(args)
      return args
    }

    return Promise.all(events.map(eventName => {
      return new Promise(resolve => {
        if (eventName instanceof Array){
          this.onceAny(eventName, resolve)
        }
        else {
          this.once(eventName, resolve)
        }
      })
    }))
    .then(handlerWrapper)
  }

  /**
   * Prevent changes to the app configuration
   */
  freezeConfig () {
    this.config.freeze(this.loadedModules)
  }

  /**
   * Allow changes to the app configuration
   */
  unfreezeConfig () {
    Object.defineProperties(this, {
      config: {
        value: new lib.Configuration(this.config.unfreeze(), this.env),
        configurable: true
      }
    })
  }

  /**
   * Create any configured paths which may not already exist.
   */
  createPaths () {
    if (this.config.main.createPaths === false) {
      this.log.warn('createPaths is disabled. Configured paths will not be created')
    }
    return lib.Core.createDefaultPaths(this)
  }

  /**
   * Expose the logger on the app object. The logger can be configured by
   * setting the "config.log.logger" config property.
   */
  get log () {
    return this.config.log.logger
  }

  /**
   * Expose the i18n translator on the app object. Internationalization can be
   * configured in config.i18n
   */
  get __ () {
    return this.translate
  }
}
