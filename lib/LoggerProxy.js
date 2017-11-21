/*eslint no-console: 0 */

module.exports = class LoggerProxy {

  /**
   * Emit trails:log, pass the "level" parameter to the event handler as the
   * first argument.
   */
  emitLogEvent (level) {
    return (...msg) => this.app.emit('trails:log', level, msg)
  }

  /**
   * Instantiate Proxy; bind log events to default console.log
   */
  constructor (app) {
    this.app = app
    this.app.on('trails:log', (level, msg = [ ]) => (console[level] || console.log)(level, ...msg))

    return new Proxy(this.emitLogEvent.bind(this), {
      /**
       * Trap calls to log.<level>, e.g. log.info(msg), log.debug(msg) and proxy
       * them to emitLogEvent
       */
      get (target, key) {
        return target(key)
      },

      /**
       * Trap invocations of log, e.g. log(msg) and treat them as invocations
       * of log.info(msg).
       */
      apply (target, thisArg, argumentsList) {
        const [ level, ...msg ] = argumentsList
        return target(level)(...msg)
      }
    })
  }
}
