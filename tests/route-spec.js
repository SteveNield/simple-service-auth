require('winter-test-setup');

var Route = require('./../http/route'),
    jwt = require('jsonwebtoken');

describe('Route', function(){
  var sandbox, app, req, res, options, deps;

  beforeEach(function(){
    sandbox = sinon.collection;
    app = {
      post: sandbox.stub().callsFake(function(endpoint, cb){
        this[endpoint] = cb
      })
    }
    req = {
      body: {
        accessKey: '12345'
      }
    }
    res = {
      sendStatus: sandbox.stub(),
      json: sandbox.stub()
    }
    options = {
      users: [],
      secret: '876876'
    }
    stubDeps();
  })

  afterEach(function(){
    sandbox.restore();
  })

  function stubDeps(){
    deps = {
      jwt: {
        sign: sandbox.stub(jwt, 'sign')
      }
    }
  }

  it('sets a post endpoint at /authenticate', function(){
    Route(options)(app);
    app['/authenticate'].should.exist;
  })

  describe('/authenticate', function(){
    describe('when req.body.accessKey is missing', function(){
      it('responds with 400', function(){
        req.body.accessKey = undefined;
        Route(options)(app);
        app['/authenticate'](req,res);
        res.sendStatus.should.have.been.calledWith(400);
      })
    })

    describe('when req.body.accessKey does not match a configured user', function(){
      it('responds with 401', function(){
        options.users.push({
          accessKey: 'TOTALLYUNIQUE'
        });
        Route(options)(app);
        app['/authenticate'](req,res);
        res.sendStatus.should.have.been.calledWith(401);
      })
    })

    describe('when req.body.accessKey matches a configured user', function(){
      it('responds with the result of jwt.sign', function(){
        const token = '2389wkjdfhskdjfh823rfkjdfksjdf';
        options.users.push({
          accessKey: req.body.accessKey
        });
        deps.jwt.sign.returns(token);
        Route(options)(app);
        app['/authenticate'](req,res);
        res.json.should.have.been.calledWith({
          success: true,
          token: token
        })
      })
    })
  })
})
