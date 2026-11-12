const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('./errorMiddleware');

/**
 * Verify JWT token from Authorization header
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token missing. Please log in.');
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_electronic_rental_change_in_production';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User account no longer exists');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Please contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: '${req.user.role}' role does not have permission for this resource`
        )
      );
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
