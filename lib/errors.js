'use strict'

exports.LoggerNotDefinedError = class extends RangeError {
  constructor() {
    super('Trails Logger is not defined')
  }
}

exports.ApiNotDefinedError = class extends RangeError {
  constructor() {
    super('Trails API is not defined')
  }
}

exports.ConfigValidationError = class extends RangeError {
  constructor() {
    super('The "env" property cannot be nested in an environment-specific config')
  }
}
