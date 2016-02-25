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
  constructor (app) {
    super()

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }

    app.config = lib.Trails.assignConfigDefaults(app.config)

    if (!app.config.log.logger) {
      throw new Error('A logger must be set at config.log.logger. Application cannot start.')
    }

    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api
    this.bound = false
    this.running = false
    this._trails = require('./package')

    this.setMaxListeners(app.config.main.maxListeners)
  }

  /**
   * Start the App. Load all Trailpacks.
   * @return Promise
   */
  start () {
    const trailpacks = this.config.main.packs.map(Pack => new Pack(this))
    this.packs = lib.Trailpack.getTrailpackMapping(trailpacks)

    lib.Trails.bindEvents(this)
    lib.Trailpack.bindTrailpackPhaseListeners(this, trailpacks)
    lib.Trailpack.bindTrailpackMethodListeners(this, trailpacks)

    this.emit('trails:start')
    return this.after('trails:ready').then(() => this.running = true)
  }

  /**
   * Shutdown. Unbind listeners, unload trailpacks.
   * @return Promise
   */
  stop (err) {
    if (err) {
      this.log.error('\n', err.stack || '')
    }
    if (!this.running) {
      this.log.error('\n', 'The application attempted to shut down, but is not',
        'in a running state. Either it is in the process of shutting down, or',
        'did not start successfully. Trails will not attempt to shut down twice.')

      this.log.error('\n', 'Try increasing the loglevel to "debug" to learn more')
      return
    }

    this.emit('trails:stop')

    lib.Trails.unbindEvents(this)

    return Promise.all(
      Object.keys(this.packs || { }).map(packName => {
        this.log.debug('unloading trailpack', packName)
        return this.packs[packName].unload()
      }))
      .then(() => this.running = false)
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
   * Expose the logger on the app object. The logger can be configured by
   * setting the "config.log.logger" config property.
   */
  get log () {
    return this.config.log.logger
  }
}

