var Express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('../../index');

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

var app = new Express();
app.use(bodyParser());
auth.setup({ users, secret });
auth.http.route(app);
app.use(auth.http.protect(['User','Admin']));

app.get(
  '/protected_resource_1',
  function(req,res){
    res.status(200).json({ message: 'Only Users and Admins can read this' });
  }
);

app.get(
  '/protected_resource_2',
  function(req,res){
    res.status(200).json({ message: 'Only Users and Admins can read this' });
  }
)

module.exports = app.listen('5220', function(){
  console.log('listening on 5220')
});
