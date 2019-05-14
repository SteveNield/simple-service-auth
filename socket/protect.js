const jwt = require('jsonwebtoken');

const reservedEvents = ['token-request'];

const decodeToken = ({ token, secret, roles }) => {
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

const authenticateConnection = ({ packet, secret, roles, next, unauthorized }) => {
  if(!packet.handshake.hasOwnProperty('query') || !packet.handshake.query.hasOwnProperty('token')){
    return unauthorized();
  }

  const token = packet.handshake.query.token;

  decodeToken({ token, secret, roles })
    .then(next)
    .catch(unauthorized);
}

const authenticateEvent = ({ packet, secret, roles, next, unauthorized }) => {
  const eventName = packet[0];
  
  if(reservedEvents.some(e => e === eventName)){
    return next();
  }

  const args = packet[1];
  if(!args || !args.token){
    return unauthorized();
  }

  const token = args.token;

  decodeToken({ token, secret, roles })
    .then(next)
    .catch(unauthorized);
}

const protect = secret  => {
  if(!secret){
    throw new Error('secret required');
  }

  return (roles) => {
    return (packet, next) => {

      const authenticate = (packet.handshake) 
        ? authenticateConnection 
        : authenticateEvent;

      try{
        authenticate({ 
          packet, 
          secret, 
          roles, 
          next, 
          unauthorized: () => {
            next(new Error('unauthorized'));
          } 
        });
      } catch(err) {
        console.error(err);
      }
    }
  }
}

module.exports = protect;