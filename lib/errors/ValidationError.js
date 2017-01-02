'use strict'

/**
 * Generic validation error; commonly used to wrap joi errors, but can be
 * used for any validation-related exception.
 */
module.exports = class ValidationError extends Error {
  constructor (msg, details) {
    super(msg + '\n' + ValidationError.humanizeMessage(details))
  }

  get name () {
    return 'ValidationError'
  }

  /**
   * Humanize a list of error details
   *
   * @param details a joi-style "details" list
   * @param details.message
   * @param details.path
   * @param details.type
   * @param details.context
   * @return String
   */
  static humanizeMessage (details) {
    const preamble = 'The following configuration values are invalid: '
    const paths = (details || [ ]).map(({ path }) => path.replace(/\.(\d)+$/, '[$1]'))

    return preamble + paths.join(', ')
  }
}
