/*eslint max-len: 0 */

module.exports = {
  hr: '---------------------------------------------------------------',

  info: {
    start: 'Starting...',
    stop: 'Shutting down...',
    initialized: 'All trailpacks are loaded.',
    ready (app) {
      const baseUrl = app.config.get('web.baseUrl') ||
          `http://${app.config.get('web.host') || 'localhost'}:${app.config.get('web.port') || '80'}`
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
          Stores            : ${app.config.get('database.orm') ? Object.keys(app.config.get('database.stores')) : 'N/A'}
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
          Trailpacks        : ${app.loadedPacks}`
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

