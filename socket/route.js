const jwt = require('jsonwebtoken');
const keys = require('./keys');

const defaults = {
  expiresIn: '1440m'
}

module.exports = ({ users, secret, config = {} }) => {
  return (socket) => {
    socket.on(keys.TOKEN_REQUEST, ({ key }) => {
      if(!key){
        return socket.emit(keys.AUTHENTICATION_ERROR);
      }

      let user = users.find(u => u.key === key);

      if(!user){
        return socket.emit(keys.AUTHENTICATION_ERROR);
      }

      let expiresIn = config.expiresIn || defaults.expiresIn;

      let token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {expiresIn});

      socket.emit(keys.TOKEN_RESPONSE, {
        success: true,
        token
      });
    });
  }
}