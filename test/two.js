var IO = require('../');
var io = IO('http://localhost:9000/io');

io.emit('message', 'hi from two.js');

console.log('two.js');
