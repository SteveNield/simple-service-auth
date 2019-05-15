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
