var jwt = require('jsonwebtoken');

const defaults = {
  expiresIn: '1440m'
}

module.exports = ({ users, secret, config = {} }) => {
  return (app) => {
    app.post('/authenticate', function(req, res) {

      function fail(status) {
        console.log('Auth failed with status ' + status + ' Key: ' + req.body.key);
        res.sendStatus(status);
      }

      if (!req.body.key)
        return fail(400);

      let user = users.find(function(user) {
        return user.key === req.body.key;
      });

      if (!user) {
        return fail(401);
      }

      let expiresIn = config.expiresIn || defaults.expiresIn;

      let token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {expiresIn});

      res.json({success: true, token: token});
    });
  }
}
