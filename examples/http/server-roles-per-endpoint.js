var Express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('../../index');

var app = new Express();
app.use(bodyParser());

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

auth.setup({ users, secret });
auth.http.route(app);

app.get(
  '/public',
  function(req,res){
    res.status(200).json({ message: 'Anyone can read this' });
  }
);

app.get(
  '/info',
  auth.http.protect(),
  function(req,res){
    res.status(200).json({ message: 'Any authenticated user can read this' });
  }
);

app.get(
  '/protected_resource_1',
  auth.http.protect(['User', 'Admin']),
  function(req,res){
    res.status(200).json({ message: 'Only Users and Admins can read this' });
  }
);

app.get(
  '/protected_resource_2',
  auth.http.protect(['Admin']),
  function(req,res){
    res.status(200).json({ message: 'Only Admins can read this' });
  }
)

module.exports = app.listen('5221', function(){
  console.log('listening on 5221')
})
