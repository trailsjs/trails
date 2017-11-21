const TrailsApp = require('trails')
const app = require('./')
const server = new TrailsApp(app)
server.start()

module.exports = server
