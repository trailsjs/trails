'use strict'

const path = require('path')
const fs = require('fs')
const assert = require('assert')

describe('Core Trailpack', () => {
  describe('#validate', () => {
    it('should validate an api object with arbitrary keys', () => {
      assert(global.app.api.customkey)
    })
  })
  describe('#configure', () => {
    it('should create missing directories for configured paths', () => {
      assert(fs.statSync(path.resolve(__dirname, 'testdir')))
    })
    it('should set paths.temp if not configured explicitly by user', () => {
      assert(global.app.config.main.paths.temp)
    })
    it('should set paths.logs if not configured explicitly by user', () => {
      assert(global.app.config.main.paths.logs)
    })
    it('should set paths.sockets if not configured explicitly by user', () => {
      assert(global.app.config.main.paths.sockets)
    })
  })
})

