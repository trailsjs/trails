module.exports = class GraphCompletenessError extends RangeError {
  constructor (pack, stageName, eventName) {
    pack || (pack = { })
    super(`
      The trailpack "${pack.name}" cannot load.

      During the "${stageName}" lifecycle stage, "${pack.name}" waits for
      the event "${eventName}". This event will not be emitted for one
      of the following reasons:

        1. The event "${eventName}" is emitted by a another Trailpack
           that, due to its configuration, paradoxically requires that
           "${pack.name}" loaded before it.

        2. The event "${eventName}" is not emitted by any other Trailpack,
           or it is not properly declared in the Trailpack's lifecycle
           config.

      Please check that you have all the Trailpacks correctly installed
      and configured. If you think this is a bug, please file an issue:
      https://github.com/trailsjs/trails/issues.
    `)

  }

  get name () {
    return 'GraphCompletenessError'
  }
}

