/**
 * Module Dependencies
 */

var Emitter = require('emitter'),
    parse = require('url').parse,
    qs = require('querystring'),
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
  opts = opts || {};
  uri = this.parse(uri);
  var socket = this.socket = new EIO(uri, opts);
  this.emitter = Emitter({});
  socket.on('message', this.message.bind(this));
}

/**
 * Parse the uri. Convert given pathname to a querystring pathname=...
 *
 * @param {String} uri
 */

IO.prototype.parse = function(uri) {
  var obj = parse(uri),
      path = obj.pathname,
      q = obj.query;

  path = path.replace(/^\/|\/$/g, '');
  if(!path) return uri;

  this.pathname = path;

  if(q) {
    q = qs.parse(q);
    q['pathname'] = path;
  } else {
    q = { pathname : path };
  }

  q = qs.stringify(q);
  uri = uri.split('?')[0];
  return uri + '?' + q;
}

/**
 * On
 */

IO.prototype.on = function() {
  this.emitter.on.apply(this.emitter, arguments);
  return this;
}

/**
 * Send data to the server
 *
 * @param {String} event
 * @param {Mixed, ...} message
 * @return {IO}
 * @api public
 */

IO.prototype.emit = function() {
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
  this.emitter.emit.apply(this.emitter, [message.event].concat(message.message));
  return this;
};
