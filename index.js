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
   * Trailpacks are loaded in order, according to which events they listen for
   * and emit.
   */
  bindTrailpackListeners (packs) {
    this.bindTrailpackPhaseListeners(packs)
    this.bindTrailpackMethodListeners(packs)
  }

  bindTrailpackPhaseListeners (packs) {
    const configuredEvents = packs.map(pack => `trailpack:${pack.name}:configured`)
    const initializedEvents = packs.map(pack => `trailpack:${pack.name}:initialized`)

    this.after(configuredEvents).then(() => this.emit('trailpack:all:configured')),

    this.after(initializedEvents).then(() => {
      this.emit('trailpack:all:initialized')
      this.emit('trails:ready')
    })
  }

  bindTrailpackMethodListeners (packs) {
    packs.map(pack => {
      const lifecycle = pack.config.lifecycle

      this.after(lifecycle.configure.listen.concat('trailpack:all:validated'))
        .then(() => pack.configure())
        .then(() => this.emit(`trailpack:${pack.name}:configured`))
        .catch(err => this.stop(err))

      this.after(lifecycle.initialize.listen.concat('trailpack:all:configured'))
        .then(() => pack.initialize())
        .then(() => this.emit(`trailpack:${pack.name}:initialized`))
        .catch(err => this.stop(err))
    })
  }

  /**
   * Invoke .validate() on all loaded trailpacks
   */
  validateTrailpacks (packs) {
    return Promise.all(packs.map(pack => pack.validate()))
      .then(() => {
        this.packs = lib.Util.getTrailpackMapping(packs)

        this.log.verbose('Trailpacks: All Validated.')
        this.emit('trailpack:all:validated')
      })
      .catch(err => this.stop(err))
  }

  /**
   * Start the App. Load and execute all Trailpacks.
   */
  start () {
    const instantiatedPacks = this.config.main.packs.map(Pack => new Pack(this))

    this.bindEvents()
    this.bindTrailpackListeners(instantiatedPacks)
    this.validateTrailpacks(instantiatedPacks)

    this.emit('trails:start')
    return this.after('trails:ready')
  }

  /**
   * Shutdown.
   */
  stop (err) {
    if (err) this.log.error('\n', err.stack)
    this.emit('trails:stop')

    const unloadPromises = Object.keys(this.packs).map(packName => {
      const pack = this.packs[packName]
      return pack.unload()
    })

    this.removeAllListeners()
    process.removeAllListeners('exit')
    process.removeAllListeners('uncaughtException')

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
  get log() {
    return this.config.log.logger
  }

  /**
   * Handle various application events
   */
  bindEvents () {
    if (this.bound) {
      this.log.warn('trails-app: Someone attempted to bindEvents() twice! Stacktrace below.')
      this.log.warn(console.trace())
      return
    }

    this.once('trails:error:fatal', err => this.stop(err))

    process.on('exit', () => {
      this.log.verbose('Event loop is empty. I have nothing else to do. Shutting down')
    })
    process.on('uncaughtException', err => this.stop(err))

    this.bound = true
  }
}

