module.exports.for = function(requiredRoles) {
  return function(req, res, next) {
    if (!requiredRoles) {
      return res.sendStatus(500);
    }

    if (requiredRoles.find(function(requiredRole) {
      return requiredRole === req.user.role;
    }) === undefined) {
      res.sendStatus(401);
    } else {
      next();
    }
  }
}
