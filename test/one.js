var IO = require('../');
var io = IO('http://localhost:9000/io');

io.on('message', function(msg) {
  console.log('recieved message: %s', msg);
});

console.log('one.js');
