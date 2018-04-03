var jwt = require('jsonwebtoken');

module.exports = function(options) {
  return function(app) {
    app.post('/authenticate', function(req, res) {

      var failResponse = {
        success: false,
        message: 'authentication failed'
      };

      function fail(status) {
        console.log('Auth failed with status ' + status + ' Key: ' + req.body.accessKey);
        res.status(status).send(failResponse);
      }

      if (!req.body.accessKey)
        return fail(400);
        
      let user = options.users.find(function(user) {
        return user.accessKey === req.body.accessKey;
      });

      if (!user) {
        return fail(401);
      }

      let token = jwt.sign(JSON.parse(JSON.stringify(user)), options.secret, {expiresIn: '1440m'});

      res.json({success: true, token: token});
    });
  }
}
