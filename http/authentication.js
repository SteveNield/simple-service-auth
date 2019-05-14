const jwt = require('jsonwebtoken');
const requestHandlers = require('./request-handlers');

module.exports = (options) => {
  if(!options.secret){
    throw new Error('Secret is required');
  }

  return (req, res, next) => {
    const token = req.headers['x-access-token'];
    const badRequest = requestHandlers.getBadRequestHandler(res);

    if (!token) {
      return badRequest('no token');
    }

    jwt.verify(token, options.secret, (err, payload) => {
      if (err) {
        return badRequest(err);
      }

      req.user = payload;
      next();
    });
  }
}
