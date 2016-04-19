/**
 * Internationalization / Localization Settings
 * (app.config.i18n)
 *
 * If your app will touch people from all over the world, i18n (or internationalization)
 * may be an important part of your international strategy.
 *
 *
 * @see http://trailsjs.io/doc/config/i18n
 *
 */

'use strict'

module.exports = {

  /**
   * The default locale
   */
  lng: 'en',

  /**
   * The path to the locales
   */
  resources: {
    en: require('./locales/en.json')
  }

}
