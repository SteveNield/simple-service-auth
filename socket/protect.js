const jwt = require('jsonwebtoken');

const reservedEvents = ['token-request'];

function decodeToken({ token, secret, roles }){
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if(err){
        reject();
      }
  
      if(!roles || roles.length === 0) resolve();
  
      if(!roles.some(r => r === payload.role)){
        return reject();
      }
  
      resolve();
    });
  });
}

function authenticateConnection({ packet, secret, roles, next, unauthorized }){
  if(!packet.handshake.hasOwnProperty('query') || !packet.handshake.query.hasOwnProperty('token')){
    return unauthorized();
  }

  let token = packet.handshake.query.token;

  decodeToken({ token, secret, roles })
    .then(next)
    .catch(unauthorized);
}

function authenticateEvent({ packet, secret, roles, next, unauthorized }){
  let eventName = packet[0];
  
  if(reservedEvents.some(e => e === eventName)){
    return next();
  }

  let args = packet[1];
  if(!args || !args.token){
    return unauthorized();
  }

  token = args.token;

  decodeToken({ token, secret, roles })
    .then(next)
    .catch(unauthorized);
}

function protect({ secret }){
  if(!secret){
    throw new Error('secret required');
  }

  return (roles) => {
    return (packet, next) => {

      function unauthorized(){
        next(new Error('unauthorized'));
      }

      authenticate = (packet.handshake) ? authenticateConnection : authenticateEvent;

      try{
        authenticate({ packet, secret, roles, next, unauthorized });
      } catch(err) {
        console.log(err);
      }
    }
  }
}

module.exports = protect;