/**
 * Module Dependencies
 */

var Emitter, qs, EIO;

// client / server support
try {
  Emitter = require('emitter');
  qs = require('querystring');
  EIO = require('engine.io');
} catch(e) {
  Emitter = require('emitter-component');
  qs = require('qs');
  EIO = require('engine.io-client');
}

var emit = Emitter.prototype.emit;
var parse = require('url').parse;

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
  if(uri) this.connect(uri, opts);
}

/**
 * Mixin Emitter
 */

Emitter(IO.prototype);

/**
 * Connect
 *
 * @param {String} uri
 * @param {Object} opts
 * @return {IO}
 * @api public
 */

IO.prototype.connect = function(uri, opts) {
  opts = opts || {};
  uri = this.parse(uri);
  var socket = this.socket = new EIO(uri, opts);
  socket.on('message', this.message.bind(this));
  return this;
}

/**
 * Parse the uri. Convert given pathname to a querystring pathname=...
 *
 * @param {String} uri
 */

IO.prototype.parse = function(uri) {
  var obj = parse(uri);

  // handle if no http://
  if(!~uri.indexOf(obj.protocol)) {
    obj = parse(obj.protocol + '//' + uri);
  }

  var path = obj.pathname,
      q = obj.query;

  // trim "/"
  path = path.replace(/^\/|\/$/g, '');
  if(!path) return uri;

  // Add to the querystring
  if(q) {
    q = qs.parse(q);
    q['pathname'] = path;
  } else {
    q = { pathname : path };
  }

  // update the query string
  q = qs.stringify(q);
  uri = uri.split('?')[0];
  return uri + '?' + q;
}

/**
 * Send data to the server
 *
 * @param {String} event
 * @param {Object|String, ...} message
 * @return {IO}
 * @api public
 */

IO.prototype.emit = function(event) {
  var messages = [].slice.call(arguments, 1);
  this.socket.send(JSON.stringify({
    event : event,
    message : messages
  }));

  return this;
};

/**
 * Send to a specific client
 *
 * @param {String} to
 * @param {String} event
 * @param {Object|String, ...} message
 */

IO.prototype.send = function(to, event) {
  var messages = [].slice.call(arguments, 2);

  this.socket.send(JSON.stringify({
    to : to,
    event : event,
    message : messages
  }));
};

/**
 * Called when a message is recieved
 *
 * @param {Object} message
 * @return {IO}
 */

IO.prototype.message = function(message) {
  message = JSON.parse(message);
  emit.apply(this, [message.event].concat(message.message));
  return this;
};
