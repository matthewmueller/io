try {
  var IO = require('io');
} catch(e) {
  var IO = require('../');
}

var host = 'http://localhost:9777';
var assert = require('assert');

describe('IO', function() {
  var io;

  beforeEach(function(done) {
    io = IO(host);
    io.socket.once('open', function() {
      done();
    });
  });

  afterEach(function(done) {
    io.socket.once('close', function() {
      done();
    });
    io.close();
  });

  describe('io(url)', function() {
    it('io.url == host', function() {
      assert(io.url == host);
    });
  });

  // describe('io#parse(url)', function() {
  //   it('parse(/)', function() {
  //     assert('/' == io.parse('/'));
  //   });
  // });

  describe('io#emit', function() {
    it('should support strings', function(done) {
      io.on('hi', function(str) {
        assert('string' == typeof str);
        assert('hello' == str);
        done();
      });

      io.emit('hi', 'hello');
    });

    it('should support objects', function(done) {
      io.on('hi', function(obj) {
        assert(2 == Object.keys(obj).length);
        assert('a' == obj.a);
        assert('b' == obj.b);
        done();
      });

      io.emit('hi', {
        a: 'a',
        b: 'b'
      });
    });

    it('should support many arguments', function(done) {
      io.on('hi', function(hello, cool) {
        assert('string' == typeof hello);
        assert('string' == typeof cool);
        assert('hello' == hello);
        assert('cool' == cool);
        done();
      });

      io.emit('hi', 'hello', 'cool');
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

    it('should play ignore others', function(done) {
      var a = io.channel('a');
      var b = io.channel('b');

      a.on('hi', function() {
        done(new Error('a should not have fired'));
      });

      b.on('hi', function() {
        setTimeout(done, 200);
      });

      io.on('hi', function() {
        done(new Error('io should not have fired'));
      });

      b.emit('hi');
    });

    it('should play ignore others', function(done) {
      var a = io.channel('a');
      var b = io.channel('b');

      a.on('hi', function() {
        done(new Error('a should not have fired'));
      });

      b.on('hi', function() {
        done(new Error('b should not have fired'));
      });

      io.on('hi', function() {
        setTimeout(done, 200);
      });

      io.emit('hi');
    });

    it('channel() should use uids', function(done) {
      var a = io.channel();
      var b = io.channel();

      a.on('hi', function() {
        setTimeout(done, 200);
      });

      b.on('hi', function() {
        done(new Error('b should not have fired'));
      });

      a.emit('hi');
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
      io.on('cool', function(message) {
        assert('hi' == message.message);
        assert('cool' == message.id);
        done();
      });

      io.emit('cool', { message: 'hi' });
    });

    it('should work with strings', function(done) {
      io.on('cool', function(hello) {
        assert('string' == typeof hello);
        assert('hello' == hello);
        done();
      });

      io.emit('ok', 'hello');
    });

    it('should work with multiple args', function(done) {
      io.on('cool', function(hello, hi) {
        assert('string' == typeof hello);
        assert('string' == typeof hi);
        assert('hello' == hello);
        assert('hi' == hi);
        done();
      });

      io.emit('lol', 'hello', 'hi');
    });

    it('should play nice with channels', function(done) {
      var test = io.channel('test');

      io.on('cool', function(hello, hi) {
        done(new Error('should not have been called'));
      });

      test.on('cool', function(hello, hi) {
        assert('string' == typeof hello);
        assert('string' == typeof hi);
        assert('hello' == hello);
        assert('hi' == hi);
        setTimeout(done, 200);
      });

      test.emit('lol', 'hello', 'hi');
    });
  });
});
