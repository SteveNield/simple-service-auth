var Express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./../index'),
    http = require('./../index').http;

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

auth.setup({ users, secret });
http.route(app);

app.get(
  '/readprotected',
  http.protect(['Reader', 'Writer']),
  function(req,res){
    res.status(200).json({ message: 'You can read this' });
  }
);

app.get(
  '/writeprotected',
  http.protect(['Writer']),
  function(req,res){
    res.status(200).json({ message: 'You can read this' });
  }
)

app.listen('5221', function(){
  console.log('listening on 5221')
})
