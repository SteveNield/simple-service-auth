var Express = require('express'),
    bodyParser = require('body-parser'),
    SimpleAuth = require('./../index');

var app = new Express();
app.use(bodyParser());
const secret = 'supersecretdonttellanyone';

SimpleAuth.Setup({
  users: [{
    accessKey: '123123123123',
    role: 'Reader'
  }, {
    accessKey: '234234234234',
    role: 'Writer'
  }],
  secret: secret
});

SimpleAuth.Route(app);

app.get(
  '/readprotected',
  SimpleAuth.Authentication,
  SimpleAuth.Authorization.for(['Reader', 'Writer']),
  function(req,res){
    res.status(200).json({ message: 'You can read this' });
  }
);

app.get(
  '/writeprotected',
  SimpleAuth.Authentication,
  SimpleAuth.Authorization.for(['Writer']),
  function(req,res){
    res.status(200).json({ message: 'You can read this' });
  }
)

app.listen('5221', function(){
  console.log('listening on 5221')
})
