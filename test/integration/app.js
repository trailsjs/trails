const path = require('path')
const _ = require('lodash')
const smokesignals = require('smokesignals')
const Trailpack = require('trailpack')

const AppConfigLocales = {
  en: {
    helloworld: 'hello world',
    hello: {
      user: 'hello {{username}}'
    }
  },
  de: {
    helloworld: 'hallo Welt',
    hello: {
      user: 'hallo {{username}}'
    }
  }
}

const App = {
  pkg: {
    name: 'core-trailpack-test'
  },
  api: {
    customkey: {}
  },
  config: {
    main: {
      packs: [
        Trailpack
      ],
      paths: {
        testdir: path.resolve(__dirname, 'testdir')
      }
    },
    i18n: {
      lng: 'en',
      resources: {
        en: {
          translation: AppConfigLocales.en
        },
        de: {
          translation: AppConfigLocales.de
        }
      }
    }
  },
  locales: AppConfigLocales
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
