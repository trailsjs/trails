/*eslint max-len: 0 */
const _ = require('lodash')

module.exports = {
  hr: '---------------------------------------------------------------',

  info: {
    start: 'Starting...',
    stop: 'Shutting down...',
    initialized: 'All trailpacks are loaded.',
    ready (app) {
      const baseUrl = _.get(app.config, 'web.baseUrl') ||
          `http://${_.get(app.config, 'web.host') || 'localhost'}:${_.get(app.config, 'web.port') || '80'}`
      return (
        `---------------------------------------------------------------
        ${new Date()}
        Basic Info
          Application       : ${app.pkg.name}
          Application root  : ${baseUrl}
          Version           : ${app.pkg.version}
          Environment       : ${process.env.NODE_ENV}`
      )
    }
  },

  debug: {
    ready (app) {
      return (
        ` Database Info
          ORM               : ${_.get(app.config, 'database.orm') || 'NOT INSTALLED'}
          Stores            : ${_.get(app.config, 'database.orm') ? Object.keys(app.config.database.stores) : 'N/A'}
        Web Server Info
          Server            : ${_.get(app.config, 'web.server') || 'NOT INSTALLED'}
          View Engine       : ${_.get(app.config, 'views.engine') || 'NOT INSTALLED'}
          Port              : ${_.get(app.config, 'web.port') || 'N/A'}
          Routes            : ${(app.routes || [ ]).length}`
      )
    }
  },

  silly: {
    stop: `
      Happy trails to you, until we meet again.
      - Dale Evans
    `,

    ready (app) {
      return (
        ` API
          Models            : ${_.keys(app.api.models)}
          Controllers       : ${_.keys(app.api.controllers)}
          Policies          : ${_.keys(app.api.policies)}
          Trailpacks        : ${_.map(app.packs, pack => pack.name)}`
        )
    },

    initialized: `
                 ..@@@@..                   .@.                                                  @@
            .@@@@@@@@@@@@@@@@.              @@@                                                  @@
         .@@@@'            '@@@@.           @@@                                                  @@
       @@@@                    @@@@         @@@                                           ..     @@
     .@@;                        '@@.       @@@                                         .@@@@.   @@
    @@@    .@@@.         .@@@@.    @@@      @@@@@@@@@  @@@@@@@@@  @@@@@@@@@  @@@@@@@@  @@'  '@@  @@
   @@'   .@@@@@@@.     .@@@@@@@@    '@@     @@@@@@@@@  @@@@@@@@@  @@@@@@@@@  @@@@@@@@  @@.  .@@  @@
  @@'   @@@@@@@@@@@   :@@@@@@@@@@    '@@    @@@                                         '@@@@'   @@
 @@@   :@@@@@@@@@@@.  @@@@@@@@@@@@    @@@   @@@                                           ''     @@
 @@    @@@@@'@@@@@@@ :@@@@'@@@@@@@     @@   @@@                                                  @@       .@@@@@@@@@@@.
.@@    @@@@@ @@@@@@@ :@@@@ @@@@@@@     @@:  @@@   @@    .@@@@@@@    .@@@@@@@              @@     @@    .@@@@@@@@@@@@@@'
@@@     @@@' @@@@@@.  @@@@ @@@@@@@     @@+  @@@   @@ .@@@@:      .@@@@'                   @@     @@   @@@'
@@@      @@  @@@@@     '@' @@@@@'      @@:  @@@   @@@@@'        @@@'                      @@     @@  .@@
'@@          @@            @@          @@   @@@   @@@@         @@@                        @@     @@  @@@
 @@.         @@            @@         .@@   @@@   @@@         @@@                         @@     @@  .@@.
  @@.        '@@@.         @@        .@@    @@@   @@@         @@'                    ..          @@   .@@@@......
  '@@          '@@@@@@@@@@.@@       .@@'    @@@   @@'         @@.                   .@@          @@     .@@@@@@@@@@@.
   '@@.                  @@@@      .@@'     @@@   @@'         @@@                   +@@   @@     @@              '@@@.
     @@@.                 '@@     @@@       @@@   @@'         '@@.                 .@@@   @@     @@                 @@@
      '@@@.                @@  .@@@'        @@@   @@'          '@@.               .@@@@   @@     @@                 @@@
        .@@@@.             @@@@@@'          @@@   @@'           '@@@.           .@@@ @@   @@     @@                @@@
           .@@@@@@@.....   @@@.             @@@   @@'             '@@@@@.....@@@@@'  @@   @@     @@  .@@@@@@@@@@@@@@@
               '@@@@@@@@                    @@@   @@.                '@@@@@@@@@'     @@   @@     @@  '@@@@@@@@@@@@'

    `
  }
}

