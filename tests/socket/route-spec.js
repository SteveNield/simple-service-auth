require('winter-test-setup');

const route = require('./../../socket/route');
const jwt = require('jsonwebtoken');
const socketMock = require('./../socket-mockr');

describe('route', () => {
  let sandbox, deps;

  beforeEach(() => {
    sandbox = sinon.collection;
    stubDeps();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function stubDeps(){
    deps = { 
      socket: {},
      users: [],
      secret: 'sdfsldkflk2j3lkjlsdkjflk',
      jwt: {}
    };

    deps.socket = socketMock(sandbox);
    deps.users = [{ key: '234234kljlkj' }];
    deps.jwt.sign = sandbox.stub(jwt, 'sign');
  }

  it('registers a token-request event', () => {
    route({})(deps.socket);
    deps.socket.on.should.have.been.calledWith('token-request');  
  });

  describe('when token-request is emitted on the socket', () => {
    describe('when key is missing', () => {
      it('emits an authentication-error event on the socket', () => {
        route({})(deps.socket);
        deps.socket.on('authentication-error', () => {});
        deps.socket.emit('token-request', {});
        deps.socket.emit.should.have.been.calledWith('authentication-error');
      });
    });

    describe('when key is provided', () => {
      describe('when key does not match a registered user', () => {
        it('emits an authentication-error event on the socket', () => {
          route({ users: deps.users })(deps.socket);
          deps.socket.on('authentication-error', () => {});
          deps.socket.emit('token-request', { key: 'INCORRECT' });
          deps.socket.emit.should.have.been.calledWith('authentication-error');
        });
      });

      describe('when key matches a registered user', () => {
        it('returns a signed token', () => {
          const token = '1239817239871928731hskjhskdjhfkjshdfkjhsdf';
          deps.jwt.sign.returns(token);
          route({ users: deps.users })(deps.socket);
          deps.socket.on('token-response', () => {});
          deps.socket.emit('token-request', { key: deps.users[0].key });
          deps.socket.emit.should.have.been.calledWith('token-response', {
            success: true,
            token
          });
        });
      });
    });
  });
});