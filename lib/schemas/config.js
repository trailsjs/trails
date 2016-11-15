const joi = require('joi')

module.exports = joi.object().keys({
  trailpack: joi.object().keys({
    packs: joi.array(),
    paths: joi.object().keys({
      root: joi.string().required()
    }).unknown(),
    disabled: joi.array()
  }).unknown(),

  env: joi.object().keys({
    [process.env.NODE_ENV]: joi.object().required()
  }).unknown(),

  log: joi.object().keys({
    logger: joi.object()
  }).unknown()

}).unknown()
