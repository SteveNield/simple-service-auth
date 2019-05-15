# simple-service-auth

![npm](https://img.shields.io/npm/v/simple-service-auth.svg?style=flat-square)

Lightweight, simple token-based (JWT) authentication and authorization for Express and socket.io services.

Provides paths and middleware for managing access to protected express and/or socket.io services, using a given list of users and roles.

## Explanation
simple-auth requires the following 3 steps to integrate:

- **setup** - provide secret for tokenisation and establish users
- **route** - setup method of requesting a token by authenticating against a key
- **protect** - specify which endpoints or events are to be protected and which roles have access

## Installation
```
$ npm install simple-service-auth
```

## Usage (Express)

#### Server
```javascript
const express = require('express');
const auth = require('simple-auth');
const app = new express();

const secret = 'supersecretdonttellanyone';
const users = [{
  "key": "b56ae1e091c14e26be6aef2bf48ca267",
  "role": "Admin"
}];

// setup
auth.setup({ users, secret });

// route
auth.http.route(app);

// protect
app.get('/info', auth.http.protect(), (req,res) => {
  res.send('Any authenticated user can read this');
});
```

### Client
```javascript
const httpClient = require('winter-http-client');

const authenticate = () => {
  return httpClient.post({
    uri: '...authenticateUri',
    payload: {
      key: '...securekey'
    }
  });
}

const callProtectedEndpoint = authenticateResponse => {
  return httpClient.get({
    uri: protectedResourceUri,
    headers: {
      'x-access-token': authenticateResponse.token
    }
  });
}

authenticate()
  .then(callProtectedEndpoint)
  .then(console.log, console.error)
  .catch(console.error);
```
More examples can be found [./examples/http](./examples/http).  

To execute the examples:

In a terminal / console run:
```
node ./examples/http/endpoint-auth
```

In another terminal / console run:
```
node ./examples/http/client
```

The following output should be printed after running the client:
```
{ message: 'Only Users and Admins can read this' }
```

## Usage (socket.io)

### Server

```javascript
const auth = require('simple-auth');
const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server);

server.listen(5223);

const secret = 'supersecretdonttellanyone';
const users = [{
  key: '123123123123',
  role: 'Admin'
}];

//setup
auth.setup({ users, secret });

io.on('connect', (socket) => {
  console.log('connected');

  //route
  auth.socket.route(socket);

  //protect
  socket.use(auth.socket.protect(['Admin']));

  socket.on('protected-resource-1-request', () => {
    socket.emit('protected-resource-1', { message: 'protected-resource-1'});
  });
});
```

### Client
```javascript
const io = require('socket.io-client');

const socket = io.connect('http://localhost:5223');

socket.on('error', console.error);

socket.on('protected-resource-1', console.log);

socket.on('token-response', tokenResponse => {
  socket.emit('protected-resource-1-request', {
    token: tokenResponse.token
  });
});

socket.emit('token-request', {
  key: '123123123123'
});
```

Full examples can be found at [./examples/socket/](./examples/socket/)

To execute the examples:

In a terminal / console run:
```
node ./examples/socket/event-auth
```

In another terminal / console run:
```
node ./examples/socket/client
```

The following output should be printed after running the client:
```
{ message: 'protected-resource-1' }
```

## Authorization Scopes

Both Express and socket.io services can be protected with configurable granularity.

### Express

simple-service-auth uses middleware to enforce authorization rules so in an Express application, authorization can be specified across server, route and endpoint scopes.

#### Server-Level
Will apply protection to every request made to the server.
```javascript
auth.setup({ ...user_and_token_data });
const app = new Express();
app.use(auth.http.protect());

app.get('/', (req,res) => {
  res.send('protected');
});

const publicApp = new Express();

publicApp.get('/', (req,res) => {
  res.send('unprotected');
});
```

#### Route-Level
Will apply protection to every request made to the route.
```javascript
auth.setup({ ...user_and_token_data });
const app = new Express();
const route = Express.Router();
route.use(auth.http.protect());

route.get('/', (req,res) => {
  res.send('protected');
});

app.use('/', route);

app.get('/public', (req,res) => {
  res.send('unprotected');
});
```

#### Endpoint-Level
Will apply protection to every request made to the endpoint.
```javascript
auth.setup({ ...user_and_token_data });
const app = new Express();

app.get('/', auth.http.protect(), (req,res) => {
  res.send('protected');
});

app.get('/public', (req,res) => {
  res.send('unprotected');
});
```

### socket.io

Rules can be applied at the server and socket levels.

#### Server-Level
Will apply protection when a connection is attempted by a client.  If the request is unauthorized, an `error` event is emitted to the client with the message `'unauthorized'` and the connection will fail.  This means that the initial connection must contain a valid token and so an unauthenticated client is unable to attempt an authentication and receive a token.  This scenario should therefore be used where a seperate token provider service is being used.  For example, a simple Express service can be used to request tokens as long as the token secret is shared between the services.
```javascript
const server = http.createServer();
const io = require('socket.io')(server);
io.use(auth.socket.protect());

io.on('connect', socket => {
  socket.on('event-1', () => {
    socket.emit('protected-resource', {});
  });
});
```

#### Socket-Level
Will allow unauthenticated connections and establish `'token-request'` and `'token-response'` event handlers.  If the request is unauthorized, an `error` event is emitted on the socket with the message `'unauthorized'`.
```javascript
const server = http.createServer();
const io = require('socket.io')(server);

io.on('connect', socket => {
  auth.socket.route(socket); // establish 'token-request' and 'token-response' handlers
  
  socket.on('event-1', () => {
    socket.emit('protected-resource', {});
  });
});
```
