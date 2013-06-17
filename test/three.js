var IO = require('../');
var io = IO('http://localhost:9000/io/whatever');

io.emit('message', 'hi from three.js');

console.log('three.js');
