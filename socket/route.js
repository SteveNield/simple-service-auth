const jwt = require('jsonwebtoken');
const keys = require('./keys');

module.exports = ({ users, secret }) => {
  return (socket) => {
    socket.on(keys.TOKEN_REQUEST, ({ key }) => {
      if(!key){
        return socket.emit(keys.AUTHENTICATION_ERROR);
      }

      let user = users.find(u => u.key === key);

      if(!user){
        return socket.emit(keys.AUTHENTICATION_ERROR);
      }

      let token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {
        expiresIn: '1440m'
      });

      socket.emit(keys.TOKEN_RESPONSE, {
        success: true,
        token
      });
    });
  }
}