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

exports.ConfigValueError = class extends RangeError {
  constructor(msg) {
    super(msg)
  }
}
