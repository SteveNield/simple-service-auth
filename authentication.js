var jwt = require('jsonwebtoken');

module.exports = function(options){
  if(!options.secret){
    throw new Error('Secret is required');
  }

  return function(req, res, next) {
    var token = req.headers['x-access-token'];

    if (!token) {
      console.log('No token');
      return res.status(401).send();
    }

    jwt.verify(token, options.secret, function(err, payload) {
      if (err) {
        console.log(err);
        return res.status(401).send({message: 'InvalidToken'});
      }

      req.user = payload;
      next();
    });
  }
}
