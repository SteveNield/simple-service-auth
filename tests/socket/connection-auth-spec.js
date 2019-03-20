require('winter-test-setup');

const io = require('socket.io-client');
const http = require('winter-http-client');

describe('authenticating on the connection and token provision from HTTP endpoint', () => {
  let socket;

  const tokenProvider = require('./../../examples/http/endpoint-auth');
  const socketServer = require('./../../examples/socket/connection-auth');
  const USER_AUTHENTICATION_KEY = '123123123123';
  const CONTRIBUTOR_AUTHENTICATION_KEY = '234kjh234kjh2k34';
  const SOCKET_SERVER_URL = 'http://localhost:5222';
  const TOKEN_SERVER_URL = 'http://localhost:5221/authenticate';

  function connect(query){
    return new Promise((resolve) => {
      socket = io.connect(SOCKET_SERVER_URL, { query });
      socket.on('connect', resolve);
    });
  }

  function getToken(key){
    return http.post({
      uri: TOKEN_SERVER_URL,
      payload: { key }
    });
  }

  afterEach(() => {
    socket.disconnect();
  });

  after(() => {
    tokenProvider.close();
    socketServer.close();
  });

  describe('when unauthorized', () => {
    function testUnauthenticated(connectWithPayload, done){
      connectWithPayload.then(() => {
        done('expected failure but succeeded');
      }).catch(done);

      let firstErrorEmitted = false;
      socket.on('error', (err) => {
        if(firstErrorEmitted) return;

        if(err === 'unauthorized'){
           done();
        } else {
          done(`expected unauthorized but received ${err.message}`);
        }
        firstErrorEmitted = true;
      });
    }

    describe('when unauthenticated', () => {
      it('does not allow connection and emits an error', (done) => {
        testUnauthenticated(connect(), done);
      });
    });

    describe('when invalid token provided', () => {
      it('emits an unauthorized error', (done) => {
        testUnauthenticated(connect({
          token: 'INVALID'
        }), done);
      });
    });

    describe('when valid token provided but not authorized to connect', () => {
      it('emits an unauthorized error', (done) => {
        getToken(CONTRIBUTOR_AUTHENTICATION_KEY).then((res) => {
          testUnauthenticated(connect({ token: res.token }), done);
        }).catch(done);
      });
    });
  });
  
  describe('when authenticated', () => {
    it('allows the connection', (done) => {
      getToken(USER_AUTHENTICATION_KEY).then((res) => {
        let doneCalled = false;
        connect({ token: res.token }).then(() => {
          done();
          doneCalled = true;
        }).catch(done);

        socket.on('error', (err) => {
          if(!doneCalled) done(err);
        });
      });
    });
  });
  
});