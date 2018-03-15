const merge = require('lodash.merge')
const path = require('path')

const ConfigurationProxyHandler = {
  get(target, key) {
    if (target.has && target.has(key)) {
      const value = target.immutable === true ? Object.freeze(target.get(key)) : target.get(key)
      return new Proxy(value, ConfigurationProxyHandler)
    }
    else {
      return target.immutable === true ? Object.freeze(target[key]) : target[key]
    }
  }
}

module.exports = class Configuration extends Map {
  constructor(configTree = {}, processEnv = {}) {
    const config = Configuration.buildConfig(configTree, processEnv.NODE_ENV)
    const configEntries = Object.entries(Configuration.flattenTree(config))
    super(configEntries)

    this.immutable = false
    this.env = processEnv

    this.get = this.get.bind(this)
    this.set = this.set.bind(this)
    this.entries = this.entries.bind(this)
    this.has = this.has.bind(this)

    return new Proxy(this, ConfigurationProxyHandler)
  }

  set(key, value) {
    if (this.immutable === true) {
      throw new IllegalAccessError('Cannot set properties directly on config. Use .set(key, value) (immutable)')
    }
    return super.set(key, value)
  }

  /**
   * Merge tree into this configuration. Return overwritten keys
   */
  merge(configTree) {
    const configEntries = Object.entries(Configuration.flattenTree(configTree))
    return configEntries.map(([key, value]) => {
      const hasKey = this.has(key)

      //if the key already exist and it's an object, we need to merge values before setting in on the map or we lose some data
      if (hasKey) {
        const currentValue = this.get(key)
        if (typeof currentValue === 'object' && !Array.isArray(currentValue)) {
          value = Object.assign({}, value, currentValue)
        }
      }
      this.set(key, value)

      return { hasKey, key }
    })
  }

  /**
   * Prevent changes to the app configuration
   */
  freeze() {
    this.immutable = true
  }

  /**
   * Allow changes to the app configuration
   */
  unfreeze() {
    this.immutable = false
  }

  /**
   * Flattens configuration tree
   */
  static flattenTree(tree = {}) {
    const toReturn = {}

    Object.entries(tree).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        const flatObject = Configuration.flattenTree(v)
        Object.keys(flatObject).forEach(flatKey => {
          toReturn[`${k}.${flatKey}`] = flatObject[flatKey]
        })
      }
      toReturn[k] = v
    })
    return toReturn
  }

  /**
   * Copy and merge the provided configuration into a new object, decorated with
   * necessary default and environment-specific values.
   */
  static buildConfig(initialConfig = {}, nodeEnv) {
    const root = path.resolve(path.dirname(require.main.filename))
    const temp = path.resolve(root, '.tmp')
    const envConfig = initialConfig.env && initialConfig.env[nodeEnv] || {}

    const configTemplate = {
      main: {
        maxListeners: 128,
        packs: [],
        paths: {
          root: root,
          temp: temp,
          sockets: path.resolve(temp, 'sockets'),
          logs: path.resolve(temp, 'log')
        },
        freezeConfig: true,
        createPaths: true
      }
    }

    return merge(configTemplate, initialConfig, envConfig, { env: nodeEnv })
  }
}

