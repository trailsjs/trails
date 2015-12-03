/**
 * @module server
 *
 * This code is part of the Trails framework. Don't edit it.
 */
const rc = require('rc')
const TrailsApp = require('trails')
const testapp = require('./')
const app = new TrailsApp(testapp)

app.start(rc('trails')).catch(app.stop)
