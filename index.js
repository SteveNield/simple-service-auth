const httpRoute = require('./http/route');
const httpAuthentication = require('./http/authentication');
const httpAuthorization = require('./http/authorization');
const httpProtect = require('./http/protect');

const http = {};

function setup({ users, secret }){
  http.route = httpRoute({ users, secret });
  http.protect = httpProtect({ secret });
}

module.exports = { setup, http };