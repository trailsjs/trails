'use strict'

module.exports = {

  /**
   * Index trailpacks by name
   */
  getTrailpackMapping (packs) {
    return packs.reduce((mapping, pack) => {
      mapping[pack.name] = pack
      return mapping
    }, { })
  }
}

