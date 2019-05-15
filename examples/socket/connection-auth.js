const Express = require('express');
const http = require('http');
const auth = require('../../index');
const config = require('./../authconfig.json');

const app = new Express();

const server = http.createServer(app);
server.listen(5222);

auth.setup(config);

const io = require('socket.io')(server);

io.use(auth.socket.protect(['User', 'Admin']));

io.on('connect', (socket) => {
  console.log('connected');

  socket.on('protected-resource-1-request', () => {
    socket.emit('protected-resource-1', { message: 'protected-resource-1'});
  });

  socket.on('protected-resource-2-request', () => {
    socket.emit('protected-resource-2', { message: 'protected-resource-2'});
  });
});

module.exports = server;