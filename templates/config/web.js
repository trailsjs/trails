/**
 * Server Configuration
 * (app.config.web)
 *
 * Configure the Web Server
 *
 * @see {@link http://trailsjs.io/doc/config/web}
 */
module.exports = {

  /**
   * The web server engine used by controllers and policies in this application.
   * An application can specify only one server. Multiple web servers can be used
   * via microservices.
   */
  server: 'hapi',

  /**
   * The port to bind the web server to
   */
  port: process.env.PORT || 3000
}
