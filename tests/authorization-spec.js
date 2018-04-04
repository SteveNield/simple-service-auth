require('winter-test-setup')

var Authorization = require('./../authorization');

describe('Authorization', function(){
  var sandbox, req, res, next;

  beforeEach(function(){
    sandbox = sinon.collection;
    req = {
      user: {}
    };
    res = {
      status: sandbox.stub().returns({ send: sandbox.stub() })
    };
    next = sandbox.stub();
  })

  afterEach(function(){
    sandbox.restore();
  })

  describe('when requiredRoles is not defined', function(){
    it('calls res with a 500', function(){
      Authorization.for()(req,res,next);
      res.status.should.have.been.calledWith(500);
    })
  })

  describe('when requiredRoles does not contain req.user', function(){
    it('calls res with 401', function(){
      req.user.role = 'Reader';
      Authorization.for(['Writer'])(req,res,next);
      res.status.should.have.been.calledWith(401);
    })
  })

  describe('when requiredRoles contains req.user.role', function(){
    it('calls next', function(){
      const role = 'Reader';
      req.user.role = role;
      Authorization.for([role])(req,res,next);
      next.should.have.been.calledOnce;
    })
  })
})
