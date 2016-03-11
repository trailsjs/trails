/**
 * @module server
 *
 * This code is part of the Trails framework.
 */

'use strict'

const app = require('./')
const TrailsApp = require('trails')
const server = new TrailsApp(app)

server.start().catch(() => server.stop())
