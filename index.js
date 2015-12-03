'use strict'

const _ = require('lodash')
const Trailpack = require('trailpack')
const PackWrapper = require('./lib/packwrapper')
const events = require('events')

module.exports = class TrailsApp extends events.EventEmitter {

  constructor (app) {
    super()

    process.env.NODE_ENV || (process.env.NODE_ENV = 'development')

    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api
    this.bound = false

    // increase listeners default
    this.setMaxListeners(64)
  }

  /**
   * Validate and Organize Trailpacks
   */
  loadTrailpacks (packs) {
    const wrappers = _.compact(packs.map(Pack => {
      if (! Pack instanceof Trailpack) {
        throw new TypeError('pack does not extend Trailpack', Pack)
      }
      if (this.config.trailpack.disabled.indexOf(Pack.name.toLowerCase()) !== -1) {
        this.app.log.debug(`trailpack: ${Pack.name.toLowerCase()} is explicitly disabled in the configuration. Not loading.`)
        return
      }

      return new PackWrapper(Pack, this)
    }))

    this.packs = _.chain(wrappers)
      .indexBy(wrapper => wrapper.pack.name)
      .mapValues(wrapper => wrapper.pack)
      .value()

    return this.validateTrailpacks(wrappers)
      .then(() => this.configureTrailpacks(wrappers))
      .then(() => this.initializeTrailpacks(wrappers))
  }

  /**
   * Invoke .validate() on all loaded trailpacks
   */
  validateTrailpacks (wrappers) {
    return Promise.all(wrappers.map(pack => {
      return pack.validate(this.pkg, this.config, this.api)
    }))
    .then(() => {
      this.emit('trailpack:all:validated')
      this.log.verbose('Trailpacks: All Validated.')
    })
  }

  /**
   * Invoke .configure() on all loaded trailpacks
   */
  configureTrailpacks (wrappers) {
    return Promise.all(wrappers.map(pack => {
      return pack.configure()
    }))
    .then(() => {
      this.emit('trailpack:all:configured')
      this.log.verbose('Trailpacks: All Configured.')
    })
  }

  /**
   * Invoke .initialize() on all loaded trailpacks
   */
  initializeTrailpacks (wrappers) {
    return Promise.all(wrappers.map(pack => {
      return pack.initialize()
    }))
    .then(() => {
      this.emit('trailpack:all:initialized')
      this.log.verbose('Trailpacks: All Initialized.')
    })
  }

  /**
   * Start the App. Load and execute all Trailpacks.
   */
  start () {
    this.bindEvents()
    this.emit('trails:start')

    return this.loadTrailpacks(this.config.trailpack.packs)
      .then(() => {
        this.emit('trails:ready')
      })
      .catch(err => {
        this.log.error(err.stack)
        throw err
      })
  }

  /**
   * Pack up and go home. Everybody has 5s to clean up.
   */
  stop (err) {
    if (err) this.log.error(err)
    this.emit('trails:stop')
    this.removeAllListeners()
    process.exit(err ? 1 : 0)
  }

  /**
   * Resolve Promise once all events in the list have emitted
   */
  after (events) {
    if (!Array.isArray(events)) {
      events = [ events ]
    }

    const eventPromises = events.map(eventName => {
      return new Promise(resolve => {
        this.once(eventName, event => {
          resolve(event)
        })
      })
    })

    return Promise.all(eventPromises)
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
      this.log.warn('trails-app: Someone attempted to bindEvents() twice!')
      /*eslint no-console: 0 */
      this.log.warn(console.trace())
      return
    }

    this.once('trails:error:fatal', err => {
      this.stop(err)
    })

    this.bound = true
  }
}
