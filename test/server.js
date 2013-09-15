/**
 * Module Dependencies
 */

var express = require('express'),
    engine = require('engine.io'),
    IO = require('io-server'),
    app = express(),
    es = new engine.Server(),
    server = module.exports = require('http').createServer(app);

/**
 * Handle the upgrade
 */

server.on('upgrade', function(req, socket, head) {
  es.handleUpgrade(req, socket, head);
});

/**
 * Configuration
 */

app.configure(function() {
  app.use(express.query());
  app.use('/engine.io', es.handleRequest.bind(es));
  app.use(express.errorHandler());
});

/**
 * Handle the connection
 */

es.on('connection', IO);

/**
 * Intercept sockets
 */

IO.on('cool', function(message, whatever) {
  message.id = 'cool';
  this.emit('cool', message);
});

IO.on('ok', function(hello) {
  this.emit('cool', hello);
});

IO.on('lol', function(hello, hi) {
  this.emit('cool', hello, hi);
});

IO.on('channel', function(lol) {

});

IO.on('disconnect', function() {
  this.socket.close();
});

/**
 * Listen if we are calling this file directly
 */

if(!module.parent) {
  var port = process.argv[2] || 9777;
  server.listen(port, function() {
    console.log('Server started on port', port);
  });
}
