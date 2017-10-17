const joi = require('joi')

module.exports = joi.object().keys({
  main: joi.object().keys({
    packs: joi.array(),
    paths: joi.object().keys({
      root: joi.string().required()
    }).unknown(),
    freezeConfig: joi.bool()
  }).required().unknown(),

  env: joi.string(), //.required(), // scott-wyatt: env is often undefined and can not be required.

  log: joi.object().keys({
    logger: joi.object()
  }).unknown()

}).unknown()
