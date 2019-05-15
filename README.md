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

Full examples can be found [./examples/http](./examples/http)

### setup

```javascript
const express = require('express');
const auth = require('simple-auth');

const secret = 'supersecretdonttellanyone';
const users = [{
  "key": "b56ae1e091c14e26be6aef2bf48ca267",
  "role": "Admin"
}];

auth.setup({ users, secret });
```

### route

```javascript
const app = new express();
auth.http.route(app);
```

### protect

```javascript
app.get(
  '/info',
  auth.http.protect(),
  (req,res) => {
    res.status(200).json({ 
      message: 'Any authenticated user can read this' 
    });
  }
);

app.get(
  '/protected_resource_1',
  auth.http.protect(['Admin']),
  (req,res) => {
    res.status(200).json({ 
      message: 'Only Admins can read this' 
    });
  }
)
```

## Usage (socket.io)

Full examples can be found at [./examples/socket/](./examples/socket/)

### setup

```javascript
const auth = require('simple-auth');
const http = require('http');

const secret = 'supersecretdonttellanyone';
const users = [{
  key: '123123123123',
  role: 'Admin'
}];

auth.setup({ users, secret });
```

### route and protect

```javascript
const server = http.createServer();
server.listen(8080);

const io = require('socket.io')(server);

io.on('connect', (socket) => {
  console.log('connected');

  auth.socket.route(socket);

  socket.use(auth.socket.protect(['Admin']));

  socket.on('protected-resource-1-request', () => {
    socket.emit('protected-resource-1', { message: 'protected-resource-1'});
  });
});
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
