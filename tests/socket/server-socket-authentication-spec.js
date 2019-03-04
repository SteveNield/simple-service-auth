require('winter-test-setup');

const io = require('socket.io-client');

describe('anonymous connection with token provision event and authentication per event', () => {
  let socket;

  const server = require('../../examples/socket/server-socket-authentication');

  function connect(){
    return new Promise((resolve) => {
      socket = io.connect('http://localhost:5223');
      socket.on('connect', resolve);
    });
  }

  beforeEach((done) => {
    connect().then(done).catch(done);
  });

  afterEach(() => {
    socket.disconnect();
  });

  after(() => {
    server.close();
  });

  it('allows connection', (done) => {
    done();
  });

  describe('when unauthenticated', () => {
    it('returns an error with unauthorized message', (done) => {
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

      socket.emit('protected-resource-1-request');
    });
  });

  describe('when authenticating', () => {
    describe('token-request', () => {
      it('returns a token', (done) => {
        socket.on('error', done);
        socket.on('token-response', (data) => {
          data.token.length.should.be.at.least(1);
          done();
        });
        socket.emit('token-request', { key: '123123123123' });
      });
    });
  });

  describe('when authenticated', () => {
    it('returns a protected-resource', (done) => {
      socket.on('error', done);
      socket.on('protected-resource-1', (data) => {
        data.message.should.equal('protected-resource-1');
        done();
      });
      socket.on('token-response', (data) => {
        socket.emit('protected-resource-1-request', { token: data.token });
      });
      socket.emit('token-request', { key: '123123123123' });
    });
  });
});