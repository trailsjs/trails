const Errors = require('./errors')

const lifecycleStages = [
  'configure',
  'initialize'
]

const Pathfinder = module.exports = {

  /**
   * Return true if the trailpack dependency graph is "complete"; i.e., that
   * the lifecycle paths for all packs and all stages are valid.
   */
  isComplete (packs) {
    return packs.every(pack => {
      return Pathfinder.isLifecycleValid (pack, packs)
    })
  },

  /**
   * Return true if all stages for a pack are valid; false otherwise
   */
  isLifecycleValid (pack, packs) {
    return lifecycleStages.every(stageName => {
      return Pathfinder.isLifecycleStageValid (pack, stageName, packs)
    })
  },

  /**
   * Return true if a particular stage is valid for the given pack; false
   * otherwise
   */
  isLifecycleStageValid (pack, stageName, packs) {
    if (!stageName || lifecycleStages.indexOf(stageName) === -1) {
      throw new TypeError(`isLifecycleStageValid: stageName must be one of ${lifecycleStages}`)
    }
    const path = Pathfinder.getLifecyclePath(pack, stageName, packs)
    const terminals = Pathfinder.getPathErrors(path)
    return !terminals.some(t => t instanceof Error)
  },

  /**
   * Traverse the lifecycle path and return the terminal values for each of its
   * branches (lifecycle events)
   */
  getPathErrors (path) {
    if (typeof path === 'boolean') {
      return [ ]
    }
    if (path instanceof Error) {
      return [ path ]
    }
    return Object.keys(path)
      .map(key => Pathfinder.getPathErrors(path[key]))
      .reduce((terminals, t) => terminals.concat(t), [ ])
  },

  getLifecyclePath (pack, stageName, packs, path) {
    const stage = pack.config.lifecycle[stageName] || { }

    if (!path) {
      return Pathfinder.getLifecyclePath (pack, stageName, packs, [ pack ])
    }

    // terminate traversal. if current pack waits for no events, then it
    // necessarily reaches the sink, and indicates a complete path.
    if (!stage.listen || stage.listen.length === 0) {
      return true
    }

    // find all packs that produce the event(s) that the current pack requires
    const producers = stage.listen
      .map(eventName => {
        return Pathfinder.getEventProducer (eventName, stageName, packs, path)
      })
      .filter(producer => !!producer)


    // return first error encountered in this path. terminate traversal.
    // one or more of the required events are not available.
    const error = producers.find(producer => producer instanceof Errors.GraphCompletenessError)
    if (error) {
      return error
    }

    // all producers must themselves have complete paths.
    return producers.reduce((level, producer) => {
      const subpath = path.concat(producer)
      level[producer.name] = Pathfinder.getLifecyclePath(producer, stageName, packs, subpath)
      return level
    }, { })
  },

  /**
   * Return all packs that produce a given event, but which is not contained
   * in the given "path" list.
   */
  getEventProducer (eventName, stageName, packs, path) {
    const producers = packs
      .filter(pack => {
        const stage = pack.config.lifecycle[stageName]
        return path.indexOf(pack) === -1 && stage.emit.indexOf(eventName) >= 0
      })

    if (producers.length > 1) {
      return new Error(`More than one trailpack produces the event ${eventName}`)
    }
    if (producers.length === 0) {
      return new Errors.GraphCompletenessError(path[path.length - 1], stageName, eventName)
    }

    return producers[0]
  }
}
