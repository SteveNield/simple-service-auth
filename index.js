const httpRoute = require('./http/route');
const httpProtect = require('./http/protect');
const socketRoute = require('./socket/route');
const socketProtect = require('./socket/protect');

function functionNotSetup(){
  throw new Error('auth has not yet been set.  call setup() first.')
}

const http = {
  route: functionNotSetup,
  protect: functionNotSetup
};

const socket = {
  route: functionNotSetup,
  protect: functionNotSetup
}

function setup({ users, secret }){
  http.route = httpRoute({ users, secret });
  http.protect = httpProtect({ secret });
  socket.route = socketRoute({ users, secret });
  socket.protect = socketProtect({ secret });
}

module.exports = { setup, http, socket };