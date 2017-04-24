const Console = require('console').Console

module.exports = class TrailsLogger extends Console {
  silly (...msg) {
    return super.log('silly:', ...msg)
  }
  debug (...msg) {
    return super.log('debug:', ...msg)
  }
  info (...msg) {
    return super.log('info:', ...msg)
  }
  log (...msg) {
    return super.log('info:', ...msg)
  }
  warn (...msg) {
    return super.log.warn('warn:', ...msg)
  }
  error (...msg) {
    return super.log.error('error:', ...msg)
  }

  constructor () {
    super(process.stdout, process.stderr)
  }
}

