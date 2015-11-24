'use strict'

const Trailpack = require('trailpack')
const PackWrapper = require('./lib/packwrapper')
const events = require('events')

module.exports = class TrailsApp extends events.EventEmitter {

  constructor (app) {
    super()

    this.pkg = app.pkg
    this.config = app.config
    this.api = app.api

    // increase listeners default
    this.setMaxListeners(64)
  }

  loadTrailpacks () {
    this.packs = this.config.trailpack.packs.map(Pack => {
      if (! Pack instanceof Trailpack) {
        throw new Error('pack does not extend Trailpack', pack)
      }

      return new PackWrapper(Pack, this)
    })

    return this.validateTrailpacks()
      .then(() => this.configureTrailpacks())
      .then(() => this.initializeTrailpacks())
  }

  validateTrailpacks () {
    return Promise.all(this.packs.map(pack => {
      return pack.validate(this.pkg, this.config, this.api)
    }))
    .then(() => {
      this.emit('trailpack:all:validated')
    })
  }

  configureTrailpacks () {
    return Promise.all(this.packs.map(pack => {
      return pack.configure()
    }))
    .then(() => {
      this.emit('trailpack:all:configured')
    })
  }

  initializeTrailpacks () {
    return Promise.all(this.packs.map(pack => {
      return pack.initialize()
    }))
    .then(() => {
      this.emit('trailpack:all:initialized')
    })
  }

  /**
   * Start the App. Load and execute all Trailpacks.
   */
  start () {
    this.emit('trails:start')

    return this.loadTrailpacks()
      .catch(err => {
        console.error(err.stack)
        throw err
      })
  }

  /**
   * Pack up and go home. Everybody has 5s to clean up.
   */
  stop (code) {
    this.emit('trails:stop')
    setTimeout(() => {
      process.exit(code || 0)
    }, 5000)
  }

  /**
   * Resolve Promise once all events in the list have emitted
   */
  after (events) {
    if (!Array.isArray(events)) {
      events = [ events ]
    }

    let eventPromises = events.map(eventName => {
      return new Promise(resolve => {
        this.once(eventName, event => {
          resolve(event)
        })
      })
    })

    return Promise.all(eventPromises)
  }

  /**
   * expose winston logger on global app object
   */
  get log() {
    return this.config.log.logger
  }
}
