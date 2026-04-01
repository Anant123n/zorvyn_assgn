const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Authentication middleware.
 * Extracts and verifies JWT from the Authorization header.
 * Attaches the authenticated user to req.user.
 * Rejects inactive or deleted users.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please log in.', 401)
      );
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3. Check if user still exists and is active
    const user = await User.findById(decoded.id).select('+password');

    if (!user || user.isDeleted) {
      return next(
        new AppError('The user associated with this token no longer exists.', 401)
      );
    }

    if (user.status === 'inactive') {
      return next(
        new AppError('Your account has been deactivated. Contact an admin.', 403)
      );
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed.', 401));
  }
};

/**
 * Authorization middleware factory.
 * Returns middleware that checks if the authenticated user has one of the allowed roles.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'analyst')
 * @returns {Function} Express middleware
 *
 * Usage: authorize('admin', 'analyst')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };
