
# io

  event-emitter build on top of [engine.io](https://github.com/learnboost/engine.io)

  Requires the engine.io server to include the `event` key in their response.

## Installation

    $ component install matthewmueller/io

## Example

```js
var io = IO('localhost:8080/news');

// Custom events
io.on('news', function(news) {...})

// Raw socket messages
io.socket.on('error', function(err) {...})

// Send a message
io.emit('news', news);
```

## API

### IO(uri, [options])

Initialize a new instance of `IO`. IO will pass these parameters into engine.io.

Engine.io squelches pathnames but maintains query parameters, so IO converts any pathname to a querystring to that it can be obtained on the serverside.

```js
IO('localhost:8080/news/today')
// internally: new EngineIO('localhost:8080/?pathname=news/today');
```

### #on(event, fn)

Listen and respond to an `event`.

### #socket

Access to the raw engine.io `socket`.

### #emit(event, message)

Send a `message` through the socket with the given `event`.

## License

  MIT
