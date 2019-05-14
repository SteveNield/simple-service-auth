require('winter-test-setup');

const Route = require('./../../http/route');
const jwt = require('jsonwebtoken');

class AppStub {
  constructor(){
    this.endpoints = {};
    this.middleware = [];
  }

  getEndpoint(endpoint){
    if(!this.endpoints.hasOwnProperty(endpoint)){
      throw new Error(`endpoint ${endpoint} not registered`);
    }
    return this.endpoints[endpoint];
  }

  post(endpoint, cb){
    this.endpoints[endpoint] = cb;
  }

  use(newMiddleware){
    this.middleware.push(newMiddleware);
  }
}

describe('Route', () => {
  let sandbox, app, req, res, options, deps;

  beforeEach(() => {
    sandbox = sinon.collection;
    app = new AppStub();
    req = {
      body: {
        key: '12345'
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

  afterEach(() => {
    sandbox.restore();
  })

  const stubDeps = () => {
    deps = {
      jwt: {
        sign: sandbox.stub(jwt, 'sign')
      }
    }
  }

  it('sets a post endpoint at /authenticate', () => {
    Route(options)(app);
    app.getEndpoint('/authenticate').should.exist;
  });

  describe('/authenticate', () => {
    describe('when req.body.key is missing', () => {
      it('responds with 400', () => {
        req.body.key = undefined;
        Route(options)(app);
        app.getEndpoint('/authenticate')(req,res);
        res.sendStatus.should.have.been.calledWith(400);
      })
    })

    describe('when req.body.key does not match a configured user', () => {
      it('responds with 401', () => {
        options.users.push({
          key: 'TOTALLYUNIQUE'
        });
        Route(options)(app);
        app.getEndpoint('/authenticate')(req,res);
        res.sendStatus.should.have.been.calledWith(401);
      })
    })

    describe('when req.body.key matches a configured user', () => {
      it('responds with the result of jwt.sign', () => {
        const token = '2389wkjdfhskdjfh823rfkjdfksjdf';
        options.users.push({
          key: req.body.key
        });
        deps.jwt.sign.returns(token);
        Route(options)(app);
        app.getEndpoint('/authenticate')(req,res);
        res.json.should.have.been.calledWith({
          success: true,
          token: token
        });
      })
    })

    describe('config', () => {
      const testExpiresIn = (desc, config, expectedExpiresIn) => {
        describe(desc, () => {
          it(`calls jwt.sign with expiresIn: ${expectedExpiresIn}`, () => {
            options.users.push({ 
              key: req.body.key 
            });
            options.config = config;
            Route(options)(app);
            app.getEndpoint('/authenticate')(req,res);
            deps.jwt.sign.args[0][2].should.deep.equal({ expiresIn: expectedExpiresIn });
          });
        });
      }

      testExpiresIn('no config provided', undefined, '1440m');
      testExpiresIn('config provided but no expiresIn', {}, '1440m');
      testExpiresIn('config provided with expiresIn', { expiresIn: '100m' }, '100m');
    });
  })
})
