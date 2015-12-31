'use strict'

const events = require('events')
const lib = require('./lib')

/**
 * The Trails Application. Merges the configuration and API resources
 * loads Trailpacks, initializes logging and event listeners.
 */
module.exports = class TrailsApp extends events.EventEmitter {

  /**
   * @param app.api The application api (api/ folder)
   * @param app.config The application configuration (config/ folder)
   * @param app.pkg The application package.json
   *
   * Initialize the Trails Application and its EventEmitter parentclass. Set
   * some necessary default configuration.
   */
  constructor (app) {
    super()

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }
    if (!app.config.env) {
      app.config.env = { }
    }
    if (!app.config.env[process.env.NODE_ENV]) {
      app.config.env[process.env.NODE_ENV] = { }
    }
    if (!app.config.main.paths) {
      app.config.main.paths = { }
    }
    if (!app.config.main.paths.root) {
      app.config.main.paths.root = process.cwd()
    }

    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api
    this.bound = false

    // increase listeners default
    this.setMaxListeners(64)
  }

  /**
   * Start the App. Load all Trailpacks.
   * @return Promise
   */
  start () {
    const instantiatedPacks = this.config.main.packs.map(Pack => new Pack(this))

    lib.Trails.bindEvents(this)
    lib.Trailpack.bindTrailpackPhaseListeners(this, instantiatedPacks)
    lib.Trailpack.bindTrailpackMethodListeners(this, instantiatedPacks)
    lib.Trailpack.validateTrailpacks(this, instantiatedPacks)

    this.emit('trails:start')
    return this.after('trails:ready')
  }

  /**
   * Shutdown. Unbind listeners, unload trailpacks.
   * @return Promise
   */
  stop (err) {
    if (err) this.log.error('\n', err.stack)
    this.emit('trails:stop')

    this.removeAllListeners()
    process.removeAllListeners('exit')
    process.removeAllListeners('uncaughtException')

    const unloadPromises = Object.keys(this.packs).map(packName => {
      const pack = this.packs[packName]
      return pack.unload()
    })

    return Promise.all(unloadPromises)
  }

  /**
   * @override
   * Log app events for debugging
   */
  emit (event) {
    this.log.debug('trails event:', event)

    // allow errors to escape and be printed on exit
    // XXX this might only be needed because I don't have all the escape hatches
    // covered that errors can escape out of
    process.nextTick(() => super.emit.apply(this, arguments))
  }

  /**
   * Resolve Promise once all events in the list have emitted
   * @return Promise
   */
  after (events) {
    if (!Array.isArray(events)) {
      events = [ events ]
    }

    return Promise.all(events.map(eventName => {
      return new Promise(resolve => this.once(eventName, resolve))
    }))
  }

  /**
   * Expose winston logger on app object.
   */
  get log () {
    return this.config.log.logger
  }

  /**
   * Expose the i18n translate function on the app object
   */
  get __ () {
    return this.packs.core.i18n.t
  }
}

