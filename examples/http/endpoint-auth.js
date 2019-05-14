const Express = require('express');
const auth = require('../../index');

const port = 5221;

const secret = 'supersecretdonttellanyone';
const users = [{
  key: '123123123123',
  role: 'User'
}, {
  key: '234kjh234kjh2k34',
  role: 'Contributor'
}, {
  key: '234234234234',
  role: 'Admin'
}];

const app = new Express();

auth.setup({ 
  users, 
  secret 
});
auth.http.route(app);

app.get(
  '/public',
  (req,res) => {
    res.status(200).json({ 
      message: 'Anyone can read this' 
    });
  }
);

app.get(
  '/info',
  auth.http.protect(),
  (req,res) => {
    res.status(200).json({ 
      message: 'Any authenticated user can read this' 
    });
  }
);

app.get(
  '/protected_resource_1',
  auth.http.protect([
    'User', 
    'Admin'
  ]),
  (req,res) => {
    res.status(200).json({ 
      message: 'Only Users and Admins can read this' 
    });
  }
);

app.get(
  '/protected_resource_2',
  auth.http.protect(['Admin']),
  (req,res) => {
    res.status(200).json({ 
      message: 'Only Admins can read this' 
    });
  }
)

module.exports = app.listen(port, () => {
  console.log(`listening on ${port}`);
})
