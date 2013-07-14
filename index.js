/**
 * Module Dependencies
 */

var Emitter, qs, EIO;

/**
 * Platform support
 */

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
var on = Emitter.prototype.on;
var once = Emitter.prototype.once;
var parse = require('url').parse;
var uid = require('uid');
var slice = [].slice;

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
  if (!(this instanceof IO)) return new IO(uri, opts);
  opts = opts || {};
  if (uri) this.connect(uri, opts);
  if (opts.socket) this.socket = opts.socket;
  if (opts.channel) this.$channel = opts.channel;
  if (this.socket) this.bind();
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
  uri = this.parse(uri);
  this.socket = new EIO(uri, opts);
  this.bind();
  return this;
};

/**
 * Setup bindings
 *
 * @api private
 */

IO.prototype.bind = function() {
  if (this.bound) return;
  this.socket.on('message', this.message.bind(this));
  this.bound = true;
  return this;
};

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
};

/**
 * Send data to the server
 *
 * @param {String} event
 * @param {Object|String, ...} message
 * @return {IO}
 * @api public
 */

IO.prototype.emit = function(event) {
  var json = {};
  json.$event = event;
  json.$message = slice.call(arguments, 1);
  if (this.$channel) json.$channel = this.$channel;
  this.socket.send(JSON.stringify(json));
  return this;
};

/**
 * Close the socket
 */

IO.prototype.close = function() {
  this.socket.close();
};

/**
 * Called when a message is recieved
 *
 * @param {Object} message
 * @return {IO}
 */

IO.prototype.message = function(str) {
  var json = JSON.parse(str);
  var event = json.$event;
  var message = json.$message;
  var channel = json.$channel;

  // ignore message if channel doesnt match or
  // no channel given for channeled socket
  if (this.$channel && !channel) return this;
  else if (channel && channel != this.$channel) return this;

  emit.apply(this, [event].concat(message));
  return this;
};

/**
 * Channel support
 *
 * @param {String} channel
 */

IO.prototype.channel = function(channel) {
  channel = channel || uid(6);
  return new IO(false, {
    socket: this.socket,
    channel: channel
  });
};
