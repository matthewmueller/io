var IO = require('io');
var host = 'http://localhost:9777';
var assert = require('assert');

describe('IO', function() {
  var io;

  beforeEach(function(done) {
    io = IO(host);
    io.socket.once('open', function() {
      console.log('opened!');
      done();
    });
  });

  afterEach(function(done) {
    io.socket.once('close', function() {
      console.log('zzz');
      done();
    });
    io.close();
  });

  describe('io#parse(url)', function() {
    it('parse(/)', function() {
      assert('/' == io.parse('/'));
    });
  });


  describe('io#channel(ch)', function() {
    it('io#channel(ch)', function(done) {

      var test = io.channel('test');
      var test2 = io.channel('test2');

      test.on('hi', function() {
        setTimeout(done, 200);
      });

      test2.on('hi', function() {
        done(new Error('channel isnt obeyed'));
      });

      test.emit('hi');
    });
  });

  describe('io(path)', function() {
    var io1, io2, io3;

    before(function(done) {
      io1 = IO(host + '/1');
      io2 = IO(host + '/2');
      io3 = IO(host + '/1/hi');

      io1.socket.on('open', next);
      io2.socket.on('open', next);
      io3.socket.on('open', next);

      var pending = 3;
      function next() {
        if (!--pending) done();
      }
    });

    after(function(done) {
      io1.socket.on('close', next);
      io2.socket.on('close', next);
      io3.socket.on('close', next);
      io1.close();
      io2.close();
      io3.close();

      var pending = 3;
      function next() {
        if (!--pending) done();
      }
    });

    it('should pool based on path', function(done) {
      var count = 2;
      var count2 = 1;

      io1.on('hi', function() {
        count--;
      });

      io2.on('hi', function() {
        done(new Error('event leak'));
      });

      io3.on('hi', function() {
        count--;
      });

      io1.on('hello', function() {
        count2--;
      });

      io3.on('hello', function() {
        count2--;
      });

      setTimeout(function() {
        if (count == 0 && count2 == 0) done();
        else done(new Error('wrong number of emitted events'));
      }, 500);


      io3.emit('hi');
      io1.emit('hello');
    });

  });

  describe('server intercept', function() {
    it('should intercept "cool" message', function(done) {
      io.emit('cool', { message: 'hi' });

      io.on('cool', function(message) {
        assert('hi' == message.message);
        assert('cool' == message.id);
        done();
      });
    });
  });
});
