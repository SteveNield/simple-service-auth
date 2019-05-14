const suites = [
  './integration-suites/connection-auth-suite.js',
  './integration-suites/event-auth-suite.js'
];

const servers = [
  './../../examples/http/endpoint-auth',
  './../../examples/socket/connection-auth',
  './../../examples/socket/event-auth'
];

const runningServers = [];

describe('integration', () => {
  before(() => {
    servers.forEach(s => runningServers.push(require(s)));
  });

  after(() => {
    runningServers.forEach(s => s.close());
  });

  suites.forEach(s => require(s)());
});