module.exports.for = function(requiredRoles) {
  return function(req, res, next) {
    if (!requiredRoles) {
      return res.status(500).send();
    }

    if (requiredRoles.find(function(requiredRole) {
      return requiredRole === req.user.role;
    }) === undefined) {
      res.status(401).send();
    } else {
      next();
    }
  }
}
