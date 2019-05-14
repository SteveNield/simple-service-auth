const jwt = require('jsonwebtoken');
const express = require('express');

const defaults = {
  expiresIn: '1440m'
}

const isPostMiddlewareApplied = (app) => {
  if(!app._router) return false;

  return !app._router.stack.some(l => {
    return l && l.handle && l.handle.name === 'json';
  });
}

module.exports = ({ users, secret, config = {} }) => {
  return (app) => {
    if (!isPostMiddlewareApplied(app)){
      app.use(express.json());
    }

    app.post('/authenticate', (req, res) => {

       const fail = (status) => {
        console.log('Auth failed with status ' + status + ' Key: ' + req.body.key);
        res.sendStatus(status);
      }

      if (!req.body.key)
        return fail(400);

      const user = users.find((user) => {
        return user.key === req.body.key;
      });

      if (!user) {
        return fail(401);
      }

      const expiresIn = config.expiresIn || defaults.expiresIn;

      const token = jwt.sign(
        JSON.parse(JSON.stringify(user)), 
        secret, 
        {
          expiresIn
        }
      );

      res.json({
        success: true, 
        token
      });
    });
  }
}
