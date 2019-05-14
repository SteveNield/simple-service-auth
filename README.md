# simple-auth

Simple token-based authentication and authorization for express and socket.io services.

Provides paths and middleware for managing access to protected express and/or socket.io services, using a given list of users and roles.

## Explanation
simple-auth requires the following 3 steps to setup: setup, route, protect.

### setup

- Establish the user and role data to be used
- Provide a secret to be used in tokenisation

#### users

```javascript
[
  {
    "name": "test-user-1",
    "key": "52703617ac104aeca3c985ac03f79d80",
    "role": "reader"
  },
  {
    "name": "test-user-2",
    "key": "e8737f4e9fbb452393e818f98ef32d61",
    "role": "writer"
  }
]
```

#### secret

## Installation
```
$ npm install simple-auth
```

## Usage (Express)
```
const auth = require('simple-auth');
```


