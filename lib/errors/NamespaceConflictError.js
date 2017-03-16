module.exports = class NamespaceConflictError extends Error {
  constructor (key, globals) {
    super(`
      The extant global variable "${key}" conflicts with the value provided by
      Trails.

      Trails defines the following variables in the global namespace:
      ${globals}
    `)
  }

  get name () {
    return 'NamespaceConflictError'
  }
}

