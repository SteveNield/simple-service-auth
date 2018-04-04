require('winter-test-setup');

var Authentication = require('./../authentication'),
    jwt = require('jsonwebtoken');

describe('Authentication', function(){
  var sandbox, req, res, next, send, options, deps;

  beforeEach(function(){
    sandbox = sinon.collection;
    options = {
      secret: 'a'
    };
    req = {
      headers: {
        'x-access-token': '12345'
      }
    };
    send = sandbox.stub();
    res = {
      status: sandbox.stub().returns({ send: send })
    };
    next = sandbox.stub();
    stubDeps();
  })

  afterEach(function(){
    sandbox.restore();
  })

  function stubDeps(){
    deps = {
      jwt: {}
    };

    deps.jwt.verify = sandbox
      .stub(jwt, 'verify');
  }

  it('returns a function', function(){
    Authentication(options).should.be.a('Function');
  })

  describe('when secret is not specified', function(){
    it('throws an error', function(done){
      try{
        options.secret = undefined;
        Authentication(options);
        done('An error was expected');
      } catch(err){
        done();
      }
    })
  })

  describe('when token is missing', function(){
    it('returns a 401', function(){
      req.headers['x-access-token'] = undefined;
      Authentication(options)(req,res,next);
      res.status.should.have.been.calledWith(401);
    })
  })

  describe('when token cannot be verified against secret', function(){
    it('returns a 401 and an appropriate message', function(done){
      deps.jwt.verify.callsFake(function(token, secret, cb){
        cb('Failed', {});
        try{
          res.status.should.have.been.calledWith(401);
          done();
        } catch(err){
          done(err);
        }
      });
      Authentication(options)(req,res,next);
    })
  })

  describe('when token is verified against secret', function(){
    it('sets the req.user to the payload and calls next()', function(done){
      const payload = {a:'b'}
      deps.jwt.verify.callsFake(function(token, secret, cb){
        if(secret === options.secret && token === req.headers['x-access-token']){
          cb(null, payload);
          try{
            req.user.should.equal(payload);
            next.should.have.been.calledOnce;
            done();
          } catch(err){
            done(err);
          }
        } else {
          done('Token ('+token+') and secret '+secret+' are not correct');
        }
      })
      Authentication(options)(req,res,next);
    })
  })
})
