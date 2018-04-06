var jwt = require('jsonwebtoken');

module.exports = function(options){
  if(!options.secret){
    throw new Error('Secret is required');
  }

  return function(req, res, next) {
    var token = req.headers['x-access-token'];

    if (!token) {
      console.log('No token');
      return res.sendStatus(401);
    }

    jwt.verify(token, options.secret, function(err, payload) {
      if (err) {
        console.log(err);
        return res.sendStatus(401);
      }

      req.user = payload;
      next();
    });
  }
}
