var jwt = require('jsonwebtoken');

module.exports = ({ users, secret }) => {
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

      let token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {expiresIn: '1440m'});

      res.json({success: true, token: token});
    });
  }
}
