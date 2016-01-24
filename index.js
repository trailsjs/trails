/*eslint no-console: 0 */
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
  constructor(app) {
    super()

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }
    if (!app.config.env) {
      app.config.env = {}
    }
    if (!app.config.env[process.env.NODE_ENV]) {
      app.config.env[process.env.NODE_ENV] = {}
    }
    if (!app.config.main.paths) {
      app.config.main.paths = {}
    }
    if (!app.config.main.paths.root) {
      app.config.main.paths.root = process.cwd()
    }

    this.log = this.buildLog(app.config)

    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api
    this.bound = false
    this._trails = require('./package')

    this.setMaxListeners(app.config.main.maxListeners || 128)
  }

  buildLog(config) {
    const logger = config.log.logger
    if (logger.levels) {
      let log = function () {
        log[logger.level].apply(log, arguments)
      }
      for (let key in logger.levels){
        log[key] = logger[key]
      }
      return log
    }
    else {
      return logger
    }
  }

  /**
   * Start the App. Load all Trailpacks.
   * @return Promise
   */
  start () {
    const trailpacks = this.config.main.packs.map(Pack => new Pack(this))

    lib.Trails.bindEvents(this)
    lib.Trailpack.bindTrailpackPhaseListeners(this, trailpacks)
    lib.Trailpack.bindTrailpackMethodListeners(this, trailpacks)

    this.emit('trails:start')
    return this.after('trails:ready')
  }

  /**
   * Shutdown. Unbind listeners, unload trailpacks.
   * @return Promise
   */
  stop(err) {
    if (err) {
      console.trace(err)
      this.log.error('\n', err.stack || '')
    }
    this.emit('trails:stop')

    lib.Trails.unbindEvents(this)

    return Promise.all(
      Object.keys(this.packs || { }).map(packName => {
        this.log.debug('unloading trailpack', packName)
        return this.packs[packName].unload()
      }))
  }

  /**
   * @override
   * Log app events for debugging
   */
  emit(event) {
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
  after(events) {
    if (!Array.isArray(events)) {
      events = [events]
    }

    return Promise.all(events.map(eventName => {
      return new Promise(resolve => this.once(eventName, resolve))
    }))
  }
}

