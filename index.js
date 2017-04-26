/*eslint no-process-env: 0 */

const EventEmitter = require('events').EventEmitter
const lib = require('./lib')

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
      throw new PackageNotDefinedError()
    }
    if (!app.api) {
      throw new ApiNotDefinedError()
    }

    app.api.models || (app.api.models = { })
    app.api.services || (app.api.services = { })
    app.api.resolvers || (app.api.resolvers = { })
    app.api.policies || (app.api.policies = { })
    app.api.controllers || (app.api.controllers = { })

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }

    const processEnv = Object.freeze(JSON.parse(JSON.stringify(process.env)))

    Object.defineProperties(this, {
      logger: {
        value: new lib.LoggerProxy(this),
        enumerable: false,
        writable: false
      },
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
      }
    })

    this.setMaxListeners(this.config.get('main.maxListeners'))

    // instantiate trailpacks
    this.config.get('main.packs').forEach(Pack => {
      try {
        const pack = new Pack(this)
        lib.Core.bindTrailpackMethodListeners(this, pack)
      }
      catch (e) {
        throw new TrailpackError(Pack, e, 'constructor')
      }
    })

    // bind resource methods
    this.controllers = lib.Core.bindMethods(this, 'controllers')
    this.policies = lib.Core.bindMethods(this, 'policies')

    lib.Core.bindApplicationListeners(this)
    lib.Core.bindTrailpackPhaseListeners(this, Object.values(this.packs))
  }

  /**
   * Start the App. Load all Trailpacks.
   *
   * @return Promise
   */
  async start () {
    this.emit('trails:start')
    return await this.after('trails:ready')
  }

  /**
   * Shutdown. Unbind listeners, unload trailpacks.
   * @return Promise
   */
  async stop (err) {
    if (err) {
      this.log.error('\n', err.stack || '')
    }

    this.emit('trails:stop')
    lib.Core.unbindListeners(this)

    await Promise.all(Object.values(this.packs).map(pack => {
      this.log.debug('Unloading trailpack', pack.name, '...')
      return pack.unload()
    }))
    this.log.debug('All trailpacks unloaded. Done.')

    return this
  }

  /**
   * Resolve Promise once ANY of the events in the list have emitted.
   *
   * @return Promise
   */
  async onceAny (events) {
    if (!Array.isArray(events)) {
      events = [events]
    }

    let resolveCallback

    return Promise.race(events.map(eventName => {
      return new Promise(resolve => {
        resolveCallback = resolve
        this.once(eventName, resolveCallback)
      })
    }))
    .then((...args) => {
      events.forEach(eventName => this.removeListener(eventName, resolveCallback))
      return args
    })
  }

  /**
   * Resolve Promise once all events in the list have emitted. Also accepts
   *
   * a callback.
   * @return Promise
   */
  async after (events) {
    if (!Array.isArray(events)) {
      events = [ events ]
    }

    return Promise.all(events.map(eventName => {
      return new Promise(resolve => {
        if (eventName instanceof Array){
          resolve(this.onceAny(eventName))
        }
        else {
          this.once(eventName, resolve)
        }
      })
    }))
  }

  /**
   * Create any configured paths which may not already exist.
   */
  async createPaths () {
    if (this.config.get('main.createPaths') === false) {
      this.log.warn('createPaths is disabled. Configured paths will not be created')
      return
    }
    return lib.Core.createDefaultPaths(this)
  }

  /**
   * Return the Trails logger
   * @fires trails:log:* log events
   */
  get log () {
    return this.logger
  }
}
