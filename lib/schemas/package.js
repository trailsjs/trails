const joi = require('joi')

module.exports = joi.object().keys({
  dependencies: joi.object().keys({
    trails: joi.string()
  }).unknown()
}).unknown()
