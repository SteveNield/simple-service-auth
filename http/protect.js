var jwt = require('jsonwebtoken');

const protect = secret => {
  if(!secret){
    throw new Error('secret is required');
  }

  return (roles) => {
    return (req,res,next) => {
      var token = req.headers['x-access-token'];
  
      if (!token) {
        console.log('no token');
        return res.sendStatus(401);
      }
  
      jwt.verify(token, secret, (err, payload) => {
        if (err) {
          console.log(err);
          return res.sendStatus(401);
        }
  
        if (!roles || roles.length === 0) return next();
    
        if (!roles.some(r => r === payload.role)) {
          res.sendStatus(401);
        } else {
          next();
        }
      });
    }
  }
}

module.exports = protect;
