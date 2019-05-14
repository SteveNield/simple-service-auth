require('winter-test-setup');

const Authentication = require('./../../http/authentication');
const jwt = require('jsonwebtoken');

describe('Authentication', () => {
  let sandbox, req, res, next, options, deps;

  beforeEach(() => {
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
      sendStatus: sandbox.stub()
    };
    next = sandbox.stub();
    stubDeps();
  })

  afterEach(() => {
    sandbox.restore();
  })

  const stubDeps = () => {
    deps = {
      jwt: {}
    };

    deps.jwt.verify = sandbox
      .stub(jwt, 'verify');
  }

  it('returns a function', () => {
    Authentication(options).should.be.a('Function');
  })

  describe('when secret is not specified', () => {
    it('throws an error', (done) => {
      try{
        options.secret = undefined;
        Authentication(options);
        done('An error was expected');
      } catch(err){
        done();
      }
    })
  })

  describe('when token is missing', () => {
    it('returns a 401', () => {
      req.headers['x-access-token'] = undefined;
      Authentication(options)(req,res,next);
      res.sendStatus.should.have.been.calledWith(401);
    })
  })

  describe('when token cannot be verified against secret', () => {
    it('returns a 401 and an appropriate message', (done) => {
      deps.jwt.verify.callsFake((token, secret, cb) => {
        cb('Failed', {});
        try{
          res.sendStatus.should.have.been.calledWith(401);
          done();
        } catch(err){
          done(err);
        }
      });
      Authentication(options)(req,res,next);
    })
  })

  describe('when token is verified against secret', () => {
    it('sets the req.user to the payload and calls next()', (done) => {
      const payload = {a:'b'}
      deps.jwt.verify.callsFake((token, secret, cb) => {
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
