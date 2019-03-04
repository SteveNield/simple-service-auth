const Express = require('express');
const http = require('http');
const auth = require('../../index');

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

const app = new Express();

const server = http.createServer(app);
server.listen(5222);

auth.setup({ users, secret });

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