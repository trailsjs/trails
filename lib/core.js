'use strict'

const fs = require('fs')
const isPlainObject = require('lodash.isplainobject')
const mapValues = require('lodash.mapvalues')
const forEach = require('lodash.foreach')
const includes = require('lodash.includes')
const isFunction = require('lodash.isFunction')

const Core = module.exports = {

  reservedMethods: [
    'app',
    'api',
    'log',
    '__',
    'constructor',
    'undefined',
    'methods',
    'config',
    'schema'
  ],

  /**
   * Bind the context of API resource methods.
   */
  bindMethods (app, resource) {
    return mapValues(app.api[resource], (Resource, resourceName) => {
      if (isPlainObject(Resource)) {
        throw new Error(`${resourceName} should be a class. It is a regular object`)
      }

      const obj = new Resource(app)

      obj.methods = Core.getClassMethods(obj)
      forEach(obj.methods, method => {
        obj[method] = obj[method].bind(obj)
      })
      return obj
    })
  },

  /**
   * Traverse protoype chain and aggregate all class method names
   */
  getClassMethods (obj) {
    const props = [ ]
    const objectRoot = new Object()

    while (!obj.isPrototypeOf(objectRoot)) {
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (props.indexOf(prop) === -1 &&
            !includes(Core.reservedMethods, prop) &&
            isFunction(obj[prop])) {

          props.push(prop)
        }
      })
      obj = Object.getPrototypeOf(obj)
    }

    return props
  },

  /**
   * create paths if they don't exist
   */
  createDefaultPaths (app) {
    const paths = app.config.main.paths

    return Promise.all(Object.keys(paths).map(pathName => {
      const dir = paths[pathName]
      if (Array.isArray(dir)) {
        dir.map(item => {
          pathCreate(item.path, pathName)
        })
      }
      else {
        pathCreate(dir, pathName)
      }
    }))
    function pathCreate(dir, pathName) {
      try {
        const stats = fs.statSync(dir)

        if (!stats.isDirectory()) {
          app.log.error('The path "', pathName, '" is not a directory.')
          app.log.error('config.main.paths should only contain paths to directories')
          return Promise.reject()
        }
      }
      catch (e) {
        fs.mkdirSync(dir)
      }
    }
  }

}
