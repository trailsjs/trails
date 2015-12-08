module.exports = {

  helloWorld (request, reply) {
    reply('Hello Trails.js !');
  },

  catchAll(request, reply) {
  	reply('<h1>This is the wrong trail</h1>');
  }
}
