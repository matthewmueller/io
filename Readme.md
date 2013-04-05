
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

Send a `message` to all connected clients with the given `event`.

```js
io.emit('reminder', data);

{
  event : 'reminder',
  message : [{...}]
}
```

The socket server ultimately decides who the recieves the messages.

### #send(to, event, message)

Send a `message` to a specific client with the given `event`. All this does is add
a `to` key to the message. It's up to the socket server to do the routing.

```js
io.send('matt', 'reminder', 'take the noodles off the stove!');

{
  to : 'matt',
  event : 'reminder',
  message : ['take the noodles off the stove']
}
```

## License

  MIT
