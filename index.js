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
 * List of channels
 */

var channels = [];

/**
 * Initialize `IO`
 *
 * @param {String} url
 * @param {Object} opts
 */

function IO(url, opts) {
  if (!(this instanceof IO)) return new IO(url, opts);
  opts = opts || {};
  this.connected = false;
  if (url) this.connect(url, opts);
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
 * @param {String} url
 * @param {Object} opts
 * @return {IO}
 * @api public
 */

IO.prototype.connect = function(url, opts) {
  this.url = url;
  url = this.parse(url);
  this.socket = new EIO(url, opts);
  this.bind();

  // update socket on channels (if any)
  for (var i = 0, channel; channel = channels[i]; i++) {
    channel.socket = this.socket;
    channel.bind();
  }

  return this;
};

/**
 * Setup bindings
 *
 * @api private
 */

IO.prototype.bind = function() {
  if (this.bound) return;
  var self = this;
  this.socket.on('message', this.message.bind(this));
  this.socket.once('open', function() {
    self.connected = true;
  });

  function emit(event) {
    return function() {
      var args = [event].concat(slice.call(arguments));
      self._emit.apply(self, args);
    };
  }

  this.socket.on('open', emit('socket open'));
  this.socket.on('close', emit('socket close'));
  this.socket.on('error', emit('socket error'));

  this.bound = true;
  return this;
};

/**
 * Parse the url. Convert given pathname to a querystring pathname=...
 *
 * @param {String} url
 */

IO.prototype.parse = function(url) {
  var obj = parse(url);

  // handle if no http://
  if(!~url.indexOf(obj.protocol)) {
    obj = parse(obj.protocol + '//' + url);
  }

  var path = obj.pathname,
      q = obj.query;

  // trim "/"
  path = path.replace(/^\/|\/$/g, '');
  if(!path) return url;

  // Add to the querystring
  if(q) {
    q = qs.parse(q);
    q.pathname = path;
  } else {
    q = { pathname : path };
  }

  // update the query string
  q = qs.stringify(q);
  url = url.split('?')[0];
  return url + '?' + q;
};

/**
 * Original emitter
 */

IO.prototype._emit = IO.prototype.emit;

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
 * @return {IO}
 */

IO.prototype.channel = function(channel) {
  channel = channel || uid(6);

  // splitting an already split channel
  if (this.$channel) {
    channel = this.$channel + ':' + channel;
  }

  var io = new IO(false, {
    socket: this.socket,
    channel: channel
  });

  // add channel to list
  channels.push(io);
  return io;
};
