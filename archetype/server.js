const TrailsApp = require('trails')
const app = require('./')
const server = new TrailsApp(app)

module.exports = server.start()
