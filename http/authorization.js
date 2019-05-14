const requestHandlers = require('./request-handlers');

module.exports.for = (requiredRoles) => {

  const requestRoleIsAuthorized = (requestRole) => {
    return requiredRoles.some((r) => {
      return r === requestRole;
    });
  }

  return (req, res, next) => {
    if (!requiredRoles) {
      return res.sendStatus(500);
    }

    const badRequest = requestHandlers.getBadRequestHandler(res);

    if (!requestRoleIsAuthorized(req.user.role)) {
      badRequest();
    } else {
      next();
    }
  }
}
