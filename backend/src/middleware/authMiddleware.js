const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { ApiError } = require('./errorMiddleware');
const { defaultUsers } = require('../utils/seedData');

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

    let user = null;
    try {
      if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        user = await User.findById(decoded.id);
      }
    } catch (_err) {
      user = null;
    }

    // Fallback for demo accounts or in-memory mode
    if (!user) {
      const fallback = defaultUsers.find(
        (u, idx) =>
          u.email === decoded.email ||
          `user_${u.role}` === decoded.id ||
          `6af5ff69a1fe32d4d266e97${idx + 1}` === decoded.id ||
          u.role === decoded.role
      );

      if (fallback) {
        user = {
          _id: decoded.id,
          id: decoded.id,
          name: fallback.name,
          email: fallback.email,
          role: fallback.role,
          phone: fallback.phone,
          address: fallback.address,
          isActive: true,
          toJSON: function () {
            return { ...this };
          }
        };
      }
    }

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
