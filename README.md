# simple-service-auth

![npm](https://img.shields.io/npm/v/simple-service-auth.svg?style=flat-square)

Lightweight, simple token-based (JWT) authentication and authorization for Express and socket.io services.

Provides paths and middleware for managing access to protected express and/or socket.io services, using a given list of users and roles.

## Explanation
simple-auth requires the following 3 steps to integrate:

- **setup** - establish user and role data to be used as well as a secret for tokenisation
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
  "role": "User"
}, {
  "key": "d363191642804de8b66236d0bb124f23",
  "role": "Contributor"
}, {
  "key": "3734d1bd6928465eb9aa141d9397b41c",
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
  auth.http.protect(['User', 'Admin']),
  (req,res) => {
    res.status(200).json({ 
      message: 'Only Users and Admins can read this' 
    });
  }
);

app.get(
  '/protected_resource_2',
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
  role: 'User'
}, {
  key: '234kjh234kjh2k34',
  role: 'Contributor'
}, {
  key: '234234234234',
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

  socket.use(auth.socket.protect(['User', 'Admin']));

  socket.on('protected-resource-1-request', () => {
    socket.emit('protected-resource-1', { message: 'protected-resource-1'});
  });

  socket.on('protected-resource-2-request', () => {
    socket.emit('protected-resource-2', { message: 'protected-resource-2'});
  });
});
```

