require('winter-test-setup')

var Authorization = require('./../../http/authorization');

describe('Authorization', () => {
  let sandbox, req, res, next;

  beforeEach(() => {
    sandbox = sinon.collection;
    req = {
      user: {}
    };
    res = {
      sendStatus: sandbox.stub()
    };
    next = sandbox.stub();
  })

  afterEach(() => {
    sandbox.restore();
  })

  describe('when requiredRoles is not defined', () => {
    it('calls res with a 500', () => {
      Authorization.for()(req,res,next);
      res.sendStatus.should.have.been.calledWith(500);
    })
  })

  describe('when requiredRoles does not contain req.user', () => {
    it('calls res with 401', () => {
      req.user.role = 'Reader';
      Authorization.for(['Writer'])(req,res,next);
      res.sendStatus.should.have.been.calledWith(401);
    })
  })

  describe('when requiredRoles contains req.user.role', () => {
    it('calls next', () => {
      const role = 'Reader';
      req.user.role = role;
      Authorization.for([role])(req,res,next);
      next.should.have.been.calledOnce;
    })
  })
})
