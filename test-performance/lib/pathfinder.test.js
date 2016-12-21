'use strict'

const assert = require('assert')
const lib = require('../../lib')
const smokesignals = require('smokesignals')

describe('lib.Pathfinder', () => {
  describe('Lifecycle', () => {
    const app = new smokesignals.TrailsApp()
    const packs = [
      new smokesignals.Trailpack(app, {
        trailpack: {
          lifecycle: {
            configure: {
              listen: [ ],
              emit: [ 'pack0:configured' ]
            },
            initialize: {
              listen: [ ],
              emit: [ 'pack0:initialized' ]
            }
          }
        }
      }, 'pack0'),

      new smokesignals.Trailpack(app, {
        trailpack: {
          lifecycle: {
            configure: {
              listen: [ 'pack0:configured' ],
              emit: [ 'pack1:configured' ]
            },
            initialize: {
              emit: [ 'pack1:initialized', 'pack1:custom' ]
            }
          }
        }
      }, 'pack1'),

      new smokesignals.Trailpack(app, {
        trailpack: {
          lifecycle: {
            configure: {
              listen: [ 'pack1:configured' ],
              emit: [ 'pack2:configured' ]
            },
            initialize: {
              listen: [ 'pack1:initialized', 'pack1:custom' ],
              emit: [ 'pack2:initialized' ]
            }
          }
        }
      }, 'pack2'),

      new smokesignals.Trailpack(app, {
        trailpack: {
          lifecycle: {
            configure: {
              listen: [ 'pack2:configured' ],
              emit: [ 'pack3:configured' ]
            },
            initialize: {
              listen: [ 'pack2:initialized', 'pack1:custom' ],
              emit: [ 'pack3:initialized' ]
            }
          }
        }
      }, 'pack3'),

      new smokesignals.Trailpack(app, {
        trailpack: {
          lifecycle: {
            // dependency with no route to source
            configure: {
              listen: [ 'packX:configured' ],
              emit: [ 'pack4:configured' ]
            },
            // dependency on pack with circular dependency
            initialize: {
              listen: [ 'pack5:initialized', 'pack0:initialized' ]
            }
          }
        }
      }, 'pack4'),

      // circular dependency
      new smokesignals.Trailpack(app, {
        trailpack: {
          lifecycle: {
            configure: {
              listen: [ 'pack5:configured' ],
              emit: [ 'pack5:configured' ]
            },
            initialize: {
              listen: [ 'pack4:initialized' ],
              emit: [ 'pack5:initialized' ]
            }
          }
        }
      }, 'pack5')
    ]

    describe('#isComplete', () => {
      it('should execute in under 5ms (n=6, with errors)', () => {
        const t0 = process.hrtime()
        const path = [ packs[0], packs[1], packs[2], packs[3], packs[4], packs[5] ]

        const complete = lib.Pathfinder.isComplete(path)

        const t1 = process.hrtime(t0)
        const t = t1[1] / 1e6

        assert(t < 5, `actual time: ${t} ms`)
        assert(!complete)
      })
      it('should execute in under 2ms (n=4, no errors)', () => {
        const t0 = process.hrtime()
        const path = [ packs[0], packs[1], packs[2], packs[3] ]

        const complete = lib.Pathfinder.isComplete(path)

        const t1 = process.hrtime(t0)
        const t = t1[1] / 1e6

        assert(t < 2, `actual time: ${t} ms`)
        assert(complete)
      })
    })
  })
})

