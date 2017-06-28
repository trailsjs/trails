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
        this.packs[pack.name] = pack
        this.config.merge(pack.config)
        lib.Core.mergeApi(this, pack)
        lib.Core.bindTrailpackMethodListeners(this, pack)
      }
      catch (e) {
        throw new TrailpackError(Pack, e, 'constructor')
      }
    })

    // instantiate resource classes and bind resource methods
    this.controllers = lib.Core.bindMethods(this, 'controllers')
    this.policies = lib.Core.bindMethods(this, 'policies')
    this.services = lib.Core.bindMethods(this, 'services')
    this.models = lib.Core.bindMethods(this, 'models')
    this.resolvers = lib.Core.bindMethods(this, 'resolvers')

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
    await this.after('trails:ready')
    return this
  }

  /**
   * Shutdown. Unbind listeners, unload trailpacks.
   * @return Promise
   */
  async stop () {
    this.emit('trails:stop')

    await Promise.all(Object.values(this.packs).map(pack => {
      this.log.debug('Unloading trailpack', pack.name, '...')
      return pack.unload()
    }))
    .then(() => {
      this.log.debug('All trailpacks unloaded. Done.')
      this.removeAllListeners()
    })

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
    .catch(err => {
      this.log.error(err, 'handling onceAny events', events)
      throw err
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
    .catch(err => {
      this.log.error(err, 'handling after events', events)
      throw err
    })
  }

  /**
   * Return the Trails logger
   * @fires trails:log:* log events
   */
  get log () {
    return this.logger
  }
}
