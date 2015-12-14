/*eslint no-console: 0 */
'use strict'

const events = require('events')
const Util = require('./lib/util')

/**
 * The Trails Application. Merges the configuration and API resources
 * loads Trailpacks, initializes logging and event listeners.
 */
module.exports = class TrailsApp extends events.EventEmitter {

  constructor (app) {
    super()

    // set correct environment
    process.env.NODE_ENV || (process.env.NODE_ENV = 'development')

    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api
    this.bound = false

    // increase listeners default
    this.setMaxListeners(64)
  }

  /**
   * Bind trailpack listeners to "this". Trailpacks are loaded in order,
   * according to which events they listen for and emit. This metadata
   * are configured in the trailpack's config in the "events" section.
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

      this.after(lifecycle.configure.listen.concat([ 'trailpack:all:validated' ]))
        .then(() => pack.configure())
        .then(() => this.emit(`trailpack:${pack.name}:configured`))
        .catch(err => this.stop(err))

      this.after(lifecycle.initialize.listen.concat([ 'trailpack:all:configured' ]))
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
        this.packs = Util.getTrailpackMapping(packs)

        this.log.verbose('Trailpacks: All Validated.')
        this.emit('trailpack:all:validated')
      })
      .catch(err => this.stop(err))
  }

  /**
   * Start the App. Load and execute all Trailpacks.
   */
  start () {
    const filteredPacks = Util.filterTrailpacks(this)

    this.bindEvents()
    this.bindTrailpackListeners(filteredPacks)
    this.validateTrailpacks(filteredPacks)

    this.emit('trails:start')
    return this.after('trails:ready')
  }

  /**
   * Shutdown.
   */
  stop (err) {
    console.log()
    if (err) this.log.error(err.stack)
    this.emit('trails:stop')
    this.removeAllListeners()
    process.removeAllListeners()
    process.exit(err ? 1 : 0)
  }

  /**
   * @override
   * Log app events for debugging
   */
  emit (event) {
    this.log.debug('trails event:', event)
    const argv = arguments

    // allow errors to escape and be printed on exit
    // XXX this might only be needed because I don't have all the escape hatches
    // covered that errors can escape out of
    process.nextTick(() => super.emit.apply(this, argv))
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
   * Expose winston logger on global app object
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
      this.log.warn('Event loop is empty. I have nothing else to do. Shutting down')
    })
    process.on('uncaughtException', err => this.stop(err))

    this.bound = true
  }
}

