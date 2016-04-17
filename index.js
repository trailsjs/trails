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
   * @param pkg The application package.json
   *
   * Initialize the Trails Application and its EventEmitter parentclass. Set
   * some necessary default configuration.
   */
  constructor (app) {
    super()

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }

    this.pkg = app.pkg
    this.config = lib.Trails.assignConfigDefaults(app.config)
    this.api = app.api
    this.bound = false
    this.started = false
    this.stopped = false
    this._trails = require('./package')

    if (!this.config.log.logger) {
      console.error('A logger must be set at config.log.logger. Application cannot start.')
      console.error('e.g. new winston.Logger({ transports: [ new winston.transports.Console() ] })')
      console.error('For more info, see the config.log archetype: https://git.io/vVvUI')
      throw new lib.Errors.LoggerNotDefinedError()
    }

    this.setMaxListeners(this.config.main.maxListeners)
  }

  /**
   * Start the App. Load all Trailpacks. The "api" property is required, here,
   * if not provided to the constructor.
   *
   * @param app.api The application api (api/ folder)
   * @param app.config The application configuration (config/ folder)
   * @return Promise
   */
  start (app) {
    if (!this.api && !(app && app.api)) {
      throw new lib.Errors.ApiNotDefinedError()
    }

    if (this.api && app && app.api) {
      this.log.info('Starting trails app with new API definition')
    }
    if (app && app.api) {
      this.api = app.api
    }

    const trailpacks = this.config.main.packs.map(Pack => new Pack(this))
    this.packs = lib.Trailpack.getTrailpackMapping(trailpacks)

    lib.Trails.bindEvents(this)
    lib.Trailpack.bindTrailpackPhaseListeners(this, trailpacks)
    lib.Trailpack.bindTrailpackMethodListeners(this, trailpacks)

    this.emit('trails:start')
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
    if (err) {
      this.log.error('\n', err.stack || '')
    }
    if (!this.started) {
      this.log.error('\n', 'The application attempted to shut down, but is not',
        'in a started state. Either it is in the process of shutting down, or',
        'did not start successfully. Trails will not attempt to shut down twice.')

      this.log.error('\n', 'Try increasing the loglevel to "debug" to learn more')
      return Promise.resolve(this)
    }

    this.emit('trails:stop')

    lib.Trails.unbindEvents(this)

    return Promise.all(
      Object.keys(this.packs || { }).map(packName => {
        this.log.debug('Unloading trailpack', packName)
        return this.packs[packName].unload()
      }))
      .then(() => {
        this.stopped = true
        return this
      })
  }

  /**
   * @override
   * Log app events for debugging
   */
  emit (event) {
    this.log.debug('trails event:', event)
    super.emit.apply(this, arguments)
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
