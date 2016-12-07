'use strict'

const EventEmitter = require('events').EventEmitter
const assert = require('assert')
const lib = require('../../lib')
const Trailpack = require('trailpack')

describe('lib.Pathfinder', () => {
  describe('#getPathErrors', () => {
    it('errors list length should be 0 when no errors found (n=2, h=1)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: true,
        packB: false
      })
      assert.equal(errors.length, 0)
    })
    it('errors list length should be 0 when no errors found (n=4, h=3)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: true,
        packB: {
          packC: {
            packD: true
          }
        }
      })
      assert.equal(errors.length, 0)
    })
    it('errors list length should be 0 when no errors found (n=9, h=4)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: true,
        packB: {
          packC: {
            packD: true,
            packE: {
              packF: true
            },
            packG: true
          }
        },
        packH: {
          packI: true
        }
      })
      assert.equal(errors.length, 0)
    })
    it('errors list length should equal number of errors found (n=6, h=2)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: {
          packB: true
        },
        packC: true,
        packD: new Error(),
        packE: {
          packF: new Error()
        }
      })
      assert.equal(errors.length, 2)
    })
    it('errors list length should equal number of errors found (n=11, h=4)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: true,
        packB: {
          packC: {
            packD: true,
            packE: {
              packF: new Error(),
              packJ: {
                packK: true
              }
            },
            packG: true
          }
        },
        packH: {
          packI: true
        }
      })
      assert.equal(errors.length, 1)
    })
    it('errors list length should equal number of errors found (n=11, h=5)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: true,
        packB: {
          packC: {
            packD: true,
            packE: {
              packF: true,
              packJ: {
                packK: new Error()
              }
            },
            packG: true
          }
        },
        packH: {
          packI: true
        }
      })
      assert.equal(errors.length, 1)
    })
    it('errors list length should equal number of errors found (n=12, h=4)', () => {
      const errors = lib.Pathfinder.getPathErrors({
        packA: true,
        packB: {
          packC: {
            packD: true,
            packE: {
              packF: true,
              packJ: {
                packK: true
              }
            },
            packG: true
          }
        },
        packH: {
          packI: true
        },
        packL: new Error()
      })
      assert.equal(errors.length, 1)
    })
  })
  describe('#getEventProducer', () => {
    const app = new EventEmitter()
    const packs = [
      new Trailpack(app, {
        pkg: {
          name: 'pack1'
        },
        config: {
          trailpack: {
            lifecycle: {
              configure: {
                emit: [ 'pack1:configured', 'pack1:custom' ]
              },
              initialize: {
                emit: [ 'pack1:initialized', 'pack1:custom' ]
              }
            }
          }
        }
      }),
      new Trailpack(app, {
        pkg: {
          name: 'pack2'
        },
        config: {
          trailpack: {
            lifecycle: {
              configure: {
                emit: [ 'pack2:configured' ]
              },
              initialize: {
                emit: [ 'pack2:initialized' ]
              }
            }
          }
        }
      })
    ]
    it('should return the trailpack that produces a particular event', () => {
      const producer = lib.Pathfinder.getEventProducer('pack1:configured', 'configure', packs, [ ])
      assert.equal(producer, packs[0])
    })
    it('should return the trailpack that produces a particular event', () => {
      const producer = lib.Pathfinder.getEventProducer('pack2:configured', 'configure', packs, [ ])
      assert.equal(producer, packs[1])
    })
    it('should return Error if there is no trailpack that produces the given event', () => {
      const producer = lib.Pathfinder.getEventProducer('nopack', 'configure', packs, [ { name: 'test' } ])
      assert(producer instanceof Error)
    })
  })

  describe('Lifecycle', () => {
    const app = new EventEmitter()
    const packs = [
      new Trailpack(app, {
        pkg: {
          name: 'pack0'
        },
        config: {
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
        }
      }),

      new Trailpack(app, {
        pkg: {
          name: 'pack1'
        },
        config: {
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
        }
      }),

      new Trailpack(app, {
        pkg: {
          name: 'pack2'
        },
        config: {
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
        }
      }),

      new Trailpack(app, {
        pkg: {
          name: 'pack3'
        },
        config: {
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
        }
      }),

      new Trailpack(app, {
        pkg: {
          name: 'pack4'
        },
        config: {
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
        }
      }),

      // circular dependency
      new Trailpack(app, {
        pkg: {
          name: 'pack5'
        },
        config: {
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
        }
      })
    ]

    describe('#getLifecyclePath', () => {

      it('should return true if pack immediately depends on source (distance=0, base case)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[0], 'configure', packs)
        assert.equal(path, true)
      })

      it('should return complete path for valid pack (distance=2, single tree path)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[2], 'configure', packs)
        assert(path)
        assert(path.pack1)
        assert.equal(path.pack1.pack0, true)
      })

      it('should return complete path for valid pack (distance=1, complex tree path)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[2], 'initialize', packs)
        assert(path)
        assert.equal(path.pack1, true)
      })

      it('should return complete path for valid pack (distance=1, complex tree path)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[2], 'initialize', packs)
        assert(path)
        assert.equal(path.pack1, true)
      })

      it('should return complete path for valid pack (distance=2, complex tree path)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[3], 'initialize', packs)
        assert(path)
        assert.equal(path.pack2.pack1, true)
        assert.equal(path.pack1, true)
      })

      it('should return path Error leaves for pack with no source route', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[4], 'configure', packs)
        assert(path instanceof Error)
      })

      it('should return path with false leaf for pack with circular dependency (within self)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[5], 'configure', packs)
        assert(path instanceof Error)
      })

      it('should return path with false leaf for pack with circular dependency (b/w dependency and self)', () => {
        const path = lib.Pathfinder.getLifecyclePath (packs[4], 'initialize', packs)
        assert.equal(path.pack0, true)
        assert(path.pack5 instanceof Error)
      })
    })

    describe('#isLifecycleStageValid', () => {
      it('should return true for a valid trailpack path (pack=sink)', () => {
        const valid = lib.Pathfinder.isLifecycleStageValid(packs[0], 'configure', packs)
        assert(valid)
      })
      it('should return true for a valid trailpack path (distance>1)', () => {
        const valid = lib.Pathfinder.isLifecycleStageValid(packs[2], 'configure', packs)
        assert(valid)
      })
      it('should return false for a invalid trailpack path (distance>1)', () => {
        const valid = lib.Pathfinder.isLifecycleStageValid(packs[5], 'configure', packs)
        assert(!valid)
      })
      it('should return false for a invalid trailpack path (cycle)', () => {
        const valid = lib.Pathfinder.isLifecycleStageValid(packs[4], 'configure', packs)
        assert(!valid)
      })
    })

    describe('#isLifecycleValid', () => {
      it('should return true for a valid trailpack path (distance=1)', () => {
        const valid = lib.Pathfinder.isLifecycleValid(packs[0], packs)
        assert(valid)
      })
      it('should return true for a valid trailpack path (distance=2)', () => {
        const valid = lib.Pathfinder.isLifecycleValid(packs[2], packs)
        assert(valid)
      })
      it('should return true for a valid trailpack path (distance=2)', () => {
        const valid = lib.Pathfinder.isLifecycleValid(packs[4], packs)
        assert(!valid)
      })
    })

    describe('#isComplete', () => {
      it('should return true for a complete trailpack graph (n=1)', () => {
        const path = [ packs[0] ]
        const valid = lib.Pathfinder.isComplete(path)
        assert(valid)
      })
      it('should return true for a complete trailpack graph (n=4)', () => {
        const path = [ packs[0], packs[1], packs[2], packs[3] ]
        const valid = lib.Pathfinder.isComplete(path)
        assert(valid)
      })
      it('should return false for an incomplete trailpack graph (n=6)', () => {
        const path = [ packs[0], packs[1], packs[2], packs[3], packs[4], packs[5] ]
        const valid = lib.Pathfinder.isComplete(path)
        assert(!valid)
      })
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

