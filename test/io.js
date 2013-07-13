var IO = require('io');
var host = 'http://localhost:9777';
var assert = require('assert');

describe('IO', function() {

  describe('io#parse(url)', function() {
    var io = IO();

    it('parse(/)', function() {
      assert('/' == io.parse('/'));
    });
  });


  describe('io#channel(ch)', function() {
    var io = IO(host);

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
    var io1 = IO(host + '/1');
    var io2 = IO(host + '/2');
    var io3 = IO(host + '/1/hi');

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
});
