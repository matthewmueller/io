/**
 * Module Dependencies
 */

var Emitter = require('emitter'),
    EIO = require('engine.io');

/**
 * Export `IO`
 */

module.exports = IO;

/**
 * Initialize `IO`
 *
 * @param {String} uri
 * @param {Object} opts
 */

function IO(uri, opts) {
  if(!(this instanceof IO)) return new IO(uri, opts);
  var socket = this.socket = new EIO(uri, opts);
  Emitter(this);
  socket.on('message', this.message.bind(this));
}

/**
 * Send data to the server
 *
 * @param {String} event
 * @param {Mixed, ...} message
 * @return {IO}
 * @api public
 */

IO.prototype.send = function() {
  var message = Array.prototype.slice.call(arguments),
      event = message.shift();

  this.socket.send(JSON.stringify({
    event : event,
    message : message
  }));

  return this;
};

/**
 * Called when a message is recieved
 *
 * @param {Object} message
 * @return {IO}
 */

IO.prototype.message = function(message) {
  message = JSON.parse(message);
  this.emit.apply(this, [message.event].concat(message.message));
  return this;
};
