require('winter-test-setup');

const protect = require('./../../socket/protect');
const jwt = require('jsonwebtoken');

describe('protect', () => {
  let sandbox, deps;

  beforeEach(() => {
    sandbox = sinon.collection;
    stubDeps();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const stubDeps = () => {
    deps = {};

    deps.next = sandbox.stub();
    deps.secret = '2349827394823hskdjfhksdjhfksjhdf';
    deps.token = '32498928734kjhsdkfjhskdjfhskdjhfksjhdf';
    deps.jwt = {
      verify: sandbox.stub(jwt, 'verify')
    };
    deps.packet = [
      'event-name',
      {
        token: ''
      }
    ];
    deps.connectionPacket = { handshake: { query: {} } };
  }

  describe('when secret is missing', () => {
    it('throws an error', (done) => {
      try{
        protect();
        done('error expected')
      } catch(err){
        done();
      }
    });
  });

  describe('when authenticating connection', () => {
    describe('when token is missing', () => {
      it('calls next with an error', () => {
        protect(deps.secret)()(deps.connectionPacket, deps.next);
        deps.next.should.have.been.calledWithMatch(sinon.match.instanceOf(Error));
      });
    });
  });

  describe('when authenticating event', () => {
    describe('when no arguments are passed', () => {
      it('calls next with an error', () => {
        deps.packet[1].token = undefined;
        protect(deps.secret)()([deps.packet[0]], deps.next);
        deps.next.should.have.been.calledWithMatch(sinon.match.instanceOf(Error));
      });
    });
  
    describe('when token is missing', () => {
      it('calls next with an error', () => {
        deps.packet[1].token = undefined;
        protect(deps.secret)()(deps.packet, deps.next);
        deps.next.should.have.been.calledWithMatch(sinon.match.instanceOf(Error));
      });
    });
  
    describe('when event name is reserved', () => {
      it('calls next', () => {
        deps.packet[0] = 'token-request';
        protect(deps.secret)()(deps.packet, deps.next);
        deps.next.args[0].length.should.equal(0);
      });
    });
  });

  describe ('when authenticating either connection or event', () => {
    describe('when a token cannot be verified against a secret', () => {
      const testInvalidTokenProducesError = (desc, mockPacket) => {
        describe(desc, () => {
          it('calls next with an error', (done) => {
            const packet = mockPacket();
            deps.jwt.verify.callsFake((t, s, cb) => {
              cb('failed', {});
            });
            protect(deps.secret)()(packet, (err) => {
              err.message.should.equal('unauthorized');
              done();
            });
          });
        });
      }

      testInvalidTokenProducesError('when authenticating connection', () => {
        deps.connectionPacket.handshake.query.token = 'INVALID';
        return deps.connectionPacket;
      });

      testInvalidTokenProducesError('when authenticating event', () => {
        deps.packet[1].token = 'INVALID';
        return deps.packet;
      });
    });
  
    describe('when a token is successfully verified', () => {
      const jwtVerifySuccess = payload => {
        deps.jwt.verify.callsFake((t, s, cb) => {
          if(s === deps.secret && t === deps.token){
            cb(null, payload);
          }
        });
      }

      const mockConnectionPacket = () => {
        deps.connectionPacket.handshake.query.token = deps.token;
        return deps.connectionPacket;
      }

      const mockEventPacket = () => {
        deps.packet[1].token = deps.token;
        return deps.packet;
      }
  
      describe('when roles is undefined', () => {
        const testNextCalledWhenRolesUndefined = (desc, mockPacket) => {
          describe(desc, () => {
            it('calls next with no error', (done) => {
              const payload = { a: 'b' };
              jwtVerifySuccess(payload);
              protect(deps.secret)()(mockPacket(), (err) => {
                expect(err).to.be.undefined;
                done();
              });
            });
          });
        }

        testNextCalledWhenRolesUndefined('when authenticating connection', mockConnectionPacket);
        testNextCalledWhenRolesUndefined('when authenticating event', mockEventPacket);
      });
  
      describe('when roles is empty', () => {
        const testNextCalledWithRolesEmpty = (desc, mockPacket) => {
          describe(desc, () => {
            it('calls next with no error', (done) => {
              const payload = { a: 'b' };
              jwtVerifySuccess(payload);
              protect(deps.secret)([])(mockPacket(), (err) => {
                expect(err).to.be.undefined;
                done();
              });
            });
          });
        }

        testNextCalledWithRolesEmpty('when authenticating connection', mockConnectionPacket);
        testNextCalledWithRolesEmpty('when authenticating event', mockEventPacket);
      });
  
      describe('when roles is defined and user has role', () => {
        const testNextCalledWhenAuthorizationSuccessful = (desc, mockPacket) => {
          describe(desc, () => {
            it('calls next with no error', (done) => {
              const payload = { role: 'Reader' };
              jwtVerifySuccess(payload);
              protect(deps.secret)(['Reader'])(mockPacket(), (err) => {
                expect(err).to.be.undefined;
                done();
              });
            });
          });
        }

        testNextCalledWhenAuthorizationSuccessful('when authenticating connection', mockConnectionPacket);
        testNextCalledWhenAuthorizationSuccessful('when authenticating event', mockEventPacket);
      });
  
      describe('when roles is deifned and user does not have role', () => {
        const testNextCalledWithErrorWhenAuthorizationUnsuccessful = (desc, mockPacket) => {
          describe(desc, () => {
            it('calls next with an error', (done) => {
              const payload = { role: 'Reader' };
              jwtVerifySuccess(payload);
              protect(deps.secret)(['Writer'])(mockPacket(), (err) => {
                err.message.should.equal('unauthorized');
                done();
              });
            });
          });
        }

        testNextCalledWithErrorWhenAuthorizationUnsuccessful('when authenticating connection', mockConnectionPacket);
        testNextCalledWithErrorWhenAuthorizationUnsuccessful('when authenticating event', mockEventPacket);
      });
    });
  });

});