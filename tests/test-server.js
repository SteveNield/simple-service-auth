var Express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./../index').http;

var app = new Express();
app.use(bodyParser());

const secret = 'supersecretdonttellanyone';
const users = [{
  accessKey: '123123123123',
  role: 'Reader'
}, {
  accessKey: '234234234234',
  role: 'Writer'
}];

auth({ users, secret }).route(app);

app.get(
  '/readprotected',
  auth.authenticate,
  auth.authorize.for(['Reader', 'Writer']),
  function(req,res){
    res.status(200).json({ message: 'You can read this' });
  }
);

app.get(
  '/writeprotected',
  auth.authenticate,
  auth.authorize.for(['Writer']),
  function(req,res){
    res.status(200).json({ message: 'You can read this' });
  }
)

app.listen('5221', function(){
  console.log('listening on 5221')
})
