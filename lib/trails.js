/*eslint no-console: 0 */
'use strict'

module.exports = {

  /**
   * Bind listeners various application events
   */
  bindEvents (app) {
    if (app.bound) {
      app.log.warn('Someone attempted to bindEvents() twice! Stacktrace below.')
      app.log.warn(console.trace())
      return
    }

    app.once('trails:error:fatal', err => app.stop(err))

    process.on('exit', () => {
      app.log.verbose('Event loop is empty. Shutting down')
    })
    process.on('uncaughtException', err => app.stop(err))

    app.bound = true
  }
}

