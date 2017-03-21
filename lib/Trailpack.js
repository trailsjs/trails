module.exports = {

  /**
   * Bind lifecycle boundary event listeners. That is, when all trailpacks have
   * completed a particular phase, e.g. "configure" or "initialize", emit an
   * :all:<phase> event.
   */
  bindTrailpackPhaseListeners (app, packs) {
    const validatedEvents = packs.map(pack => `trailpack:${pack.name}:validated`)
    const configuredEvents = packs.map(pack => `trailpack:${pack.name}:configured`)
    const initializedEvents = packs.map(pack => `trailpack:${pack.name}:initialized`)

    app.after(configuredEvents)
      .then(() => app.createPaths())
      .then(() => app.emit('trailpack:all:configured'))
      .catch(err => app.stop(err))

    app.after(validatedEvents)
      .then(() => app.emit('trailpack:all:validated'))
      .catch(err => app.stop(err))

    app.after(initializedEvents)
      .then(() => {
        app.emit('trailpack:all:initialized')
        app.emit('trails:ready')
      })
      .catch(err => app.stop(err))
  },

  /**
   * Bind individual lifecycle method listeners. That is, when each trailpack
   * completes each lifecycle, fire individual events for those trailpacks.
   */
  bindTrailpackMethodListeners (app, packs) {
    packs.map(pack => {
      const lifecycle = pack.config.lifecycle

      app.after(lifecycle.initialize.listen.concat('trailpack:all:configured'))
        .then(() => app.log.debug('trailpack: initializing', pack.name))
        .then(() => pack.initialize())
        .catch(err => app.stop(err))
        .then(() => app.emit(`trailpack:${pack.name}:initialized`))

      app.after(lifecycle.configure.listen.concat('trailpack:all:validated'))
        .then(() => app.log.debug('trailpack: configuring', pack.name))
        .then(() => pack.configure())
        .catch(err => app.stop(err))
        .then(() => app.emit(`trailpack:${pack.name}:configured`))

      app.after('trails:start')
        .then(() => app.log.debug('trailpack: validating', pack.name))
        .then(() => pack.validate())
        .catch(err => app.stop(err))
        .then(() => app.emit(`trailpack:${pack.name}:validated`))
    })
  }
}

