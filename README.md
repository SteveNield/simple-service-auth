# simple-auth

Simple token-based authentication and authorization for express and socket.io services.

Provides paths and middleware for managing access to protected express and/or socket.io services, using a given list of users and roles.

## Explanation
simple-auth requires the following 3 steps to integrate:

- **setup** - establish user and role data to be used as well as a secret for tokenisation
- **route** - setup method of requesting a token by authenticating against a key
- **protect** - specify which endpoints or events are to be protected and which roles have access

## Installation
```
$ npm install simple-auth
```

## Usage (Express)

Full example can be found [./examples/http](./examples/http).

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

```


