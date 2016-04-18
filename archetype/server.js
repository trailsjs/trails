/**
 * @module server
 *
 * Start up the Trails Application.
 */
const app = require('./')
const TrailsApp = require('trails')
const server = new TrailsApp(app)

server.start().catch(err => server.stop(err))
