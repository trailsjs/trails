const TrailsApp = require('trails')
const app = new TrailsApp({
  api: {
    controllers: {
      RunkitController: class RunkitController extends Controller {
        /**
         * Write custom logic here to test out your Trails Controller on RunKit
         */
        runkitEndpoint (request, reply) {
          reply({
            message: 'hello world!',
            from: 'trails.js',
            appName: this.app.pkg.name,
            trailsVersion: this.app._trails.version,
            body: request.body
          })
        }
      }
    }
  },
  config: {
    main: {
      packs: [
        require('trailpack-router'),
        require('trailpack-runkit')(exports)
      ]
    }
  },
  pkg: {
    name: 'trails-runkit-demo'
  }
})
app.start().catch(console.error)
