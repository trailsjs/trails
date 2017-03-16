/**
 * Start up the Trails Application.
 */
const TrailsApp = require('trails')
const app = require('./')
const server = new TrailsApp(app)

server.start().catch(err => server.stop(err))
