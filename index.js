const httpRoute = require('./http/route');
const httpAuthentication = require('./http/authentication');
const httpAuthorization = require('./http/authorization');

function http({ users, secret }){
  return {
    route: httpRoute({ users, secret }),
    authenticate: httpAuthentication({ secret }),
    authorize: httpAuthorization
  }
}

module.exports = { http };