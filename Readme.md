
# io

  event-emitter build on top of [engine.io](https://github.com/learnboost/engine.io)

  Requires the engine.io server to include the `event` key in their response.

## Installation

    $ component install matthewmueller/io

## Example

```js
var io = IO({
  host : 'ws.example.com',
  port : 8080
});

// Custom events
io.on('comment', function(comment) {...})

// Raw socket messages
io.socket.on('error', function(err) {...})

// Send a message
io.send('comment', comment);
```

## API

### IO(options)

Initialize a new instance of `IO`.

### IO.on(event, fn)

Listen and respond to an `event`.

### IO.socket

Access to the raw engine.io `socket`.

### IO.send(event, message)

Send a `message` through the socket with the given `event`.

## TODO

* engine.io as a component

## License

  MIT
