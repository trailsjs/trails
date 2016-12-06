/**
 * @module server
 *
 * Start up the Trails Application.
 */

'use strict'

const TrailsApp = require('trails')
const app = require('./')
const server = new TrailsApp(app)

server.start().catch(err => server.stop(err))
