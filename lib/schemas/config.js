const joi = require('joi')

module.exports = joi.object().keys({
  main: joi.object().keys({
    packs: joi.array(),
    paths: joi.object().keys({
      root: joi.string().required()
    }).unknown(),
    freezeConfig: joi.bool()
  }).required().unknown(),

  env: joi.string().required(),

  log: joi.object().keys({
    logger: joi.object()
  }).unknown()

}).unknown()
