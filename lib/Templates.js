/*eslint max-len: 0 */

module.exports = {
  hr: '---------------------------------------------------------------',
  docs: 'Trails Documentation: http://trailsjs.io/doc',

  info: {
    start: 'Starting...',
    stop: 'Shutting down...',
    initialized: 'All trailpacks are loaded.',
    ready (app) {
      const baseUrl = app.config.get('web.baseUrl') ||
          `http://${app.config.get('web.host') || 'localhost'}:${app.config.get('web.port') || '80'}`
      return (
        `---------------------------------------------------------------
        Now: ${new Date()}
        Basic Info
          Application       : ${app.pkg.name}
          Base URL          : ${baseUrl}
          Version           : ${app.pkg.version}
          Environment       : ${app.env.NODE_ENV}`
      )
    }
  },

  debug: {
    ready (app) {
      return (
        ` Database Info
          Stores            : ${Object.keys(app.config.get('stores') || { })}
        Web Server Info
          Server            : ${app.config.get('web.server') || 'NOT INSTALLED'}
          Port              : ${app.config.get('web.port') || 'N/A'}
          Routes            : ${(app.routes || [ ]).length}`
      )
    }
  },

  silly: {
    ready (app) {
      return (
        ` API
          Models            : ${Object.keys(app.api.models)}
          Controllers       : ${Object.keys(app.api.controllers)}
          Policies          : ${Object.keys(app.api.policies)}
          Trailpacks        : ${Object.keys(app.packs)}`
      )
    },

    initialized: `
▓▓▓▓▓▓▓▓▓▀▓ ▓▓▓▓▓▓▓▓▓▌
▓▓▓▓▓▓▓▓  ▓  ▀▓▓▓▓▓▓▓▌
▓▓▓▓▓▓▀   ▓    ▀▓▓▓▓▓▌      ▄▄▄▄▄▄▄▄   ▄▄▄▄▄        ▄       ▄    ▄        ▄▄▄▄▄
▓▓▓▀      ▓      ▀█▓▓▌         ▐▓      ▓   ▀▓      ▓▀▓     ▐▓    ▓▌      ▓▌   █▌
▀         ▓                    ▐▓      ▓    ▓     ▓▌ ▐▓    ▐▓    ▓▌      ▀█▓▄▄▄
          ▓                    ▐▓      ▓▀▀▓▓     ▓▓▄▄▄▓▓   ▐▓    ▓▌           ▀▓
         ▄▓▓                   ▐▓      ▓   ▀▓   ▓▓     ▓▌  ▐▓    ▓▌▄▄▄▄  ▀▓▄▄▄▓▀
       ▄▓▀  ▀▓
    ▄▓▀  ▄▓▄  ▀█▄
  ▀▀    ▀▀▀▀▀▀   ▀▀▀
    `
  }
}

