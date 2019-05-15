const httpClient = require('winter-http-client');

const authenticateUri = 'http://localhost:5221/authenticate';
const protectedResourceUri = 'http://localhost:5221/protected_resource_1';
const key = '123123123123';

const authenticate = () => {
  return httpClient.post({
    uri: authenticateUri,
    payload: {
      key
    }
  });
}

const callProtectedEndpoint = authenticateResponse => {
  return httpClient.get({
    uri: protectedResourceUri,
    headers: {
      'x-access-token': authenticateResponse.token
    }
  });
}

authenticate()
  .then(callProtectedEndpoint)
  .then(console.log, console.error)
  .catch(console.error);