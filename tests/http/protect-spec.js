require('winter-test-setup');

const protect = require('./../../http/protect');
const jwt = require('jsonwebtoken');

describe('protect', () => {
  let sandbox, req, res, next, send, secret, deps;

  beforeEach(() => {
    sandbox = sinon.collection;
    secret = 'a';
    req = { headers: { 'x-access-token': '12345' }};
    send = sandbox.stub();
    res = { sendStatus: sandbox.stub() };
    next = sandbox.stub();
    stubDeps();
  })

  afterEach(() => {
    sandbox.restore();
  });

  function stubDeps(){
    deps = { jwt: {} };

    deps.jwt.verify = sandbox
      .stub(jwt, 'verify');
  }

  it('returns a function', () => {
    protect({ secret }).should.be.a('Function');
  });

  describe('when a secret is not specified', () => {
    it('throws an error', (done) => {
      try{
        Authentication({ });
        done('An error was expected');
      } catch(err){
        done();
      }
    });
  })

  describe('when token is missing', () => {
    it('returns a 401', () => {
      protect({ secret })()({ headers: [] }, res, next);
      res.sendStatus.should.have.been.calledWith(401);
    })
  });

  describe('when token cannot be verified against secret', () => {
    it('returns a 401 and an appropriate message', (done) => {
      deps.jwt.verify.callsFake((token, sc, cb) => {
        cb('failed', {});
        try{
          res.sendStatus.should.have.been.calledWith(401);
          done();
        } catch(err) {
          done(err);
        }
      })
      protect({ secret })()(req,res,next);
    })
  });

  describe('when token is verified against secret', () => {
    function assertOnJwtVerifySuccess(payload, done, assertion){
      deps.jwt.verify.callsFake((token, sc, cb) => {
        if(sc === secret && token === req.headers['x-access-token']){
          cb(null, payload);
          try{
            assertion();
            done();
          } catch(err){
            done(err);
          }
        } else {
          done('Token ('+token+') and secret '+secret+' are not correct');
        }
      })
    }

    describe('when roles is undefined', () => {
      it('calls next()', (done) => {
        const payload = { a: 'b' };
        assertOnJwtVerifySuccess(payload, done, () => {
          next.should.have.been.calledOnce;
        });
        protect({ secret })()(req,res,next);
      });
    });

    describe('when roles is defined and user has role', () => {
      it('calls next', (done) => {
        const payload = { role: 'Reader' };
        assertOnJwtVerifySuccess(payload, done, () => {
          next.should.have.been.calledOnce;
        });
        protect({ secret })([ 'Reader' ])(req,res,next);
      });
    });

    describe('when roles is defined and user does not have role', () => {
      it('returns a 401', (done) => {
        const payload = { role: 'Reader' };
        assertOnJwtVerifySuccess(payload, done, () => {
          res.sendStatus.should.have.been.calledWith(401);
        });
        protect({ secret })([ 'Writer' ])(req,res,next);
      })
    });
  })
});