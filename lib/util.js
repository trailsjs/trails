'use strict'

module.exports = {

  filterTrailpacks (app) {
    return app.config.trailpack.packs.filter(Pack => {
      const packName = Pack.name.toLowerCase()
      const disabledList = app.config.trailpack.disabled
      const disabled = disabledList.indexOf(packName) !== -1

      if (disabled) {
        app.log.warn(`Refusing to load trailpack: ${packName} is explicitly disabled in the configuration`)
        new Pack({ }).unload()
      }

      return !disabled
    })
    .map(Pack => new Pack(app))
  },

  getTrailpackMapping (packs) {
    return packs.reduce((mapping, pack) => {
      mapping[pack.name] = pack
      return mapping
    }, { })
  }
}

