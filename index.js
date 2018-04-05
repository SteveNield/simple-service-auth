var Route = require('./route'),
    Authentication = require('./authentication'),
    Authorization = require('./authorization');

var SimpleAuth = {
  Setup: _setup
};

function _setup(options){
  SimpleAuth.Authentication = Authentication({
    secret: options.secret
  }),
  SimpleAuth.Authorization = Authorization,
  SimpleAuth.Route = Route({
    secret: options.secret,
    users: options.users
  })
}

module.exports = SimpleAuth;
