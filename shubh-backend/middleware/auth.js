'use strict';

const AppError    = require('../utils/AppError');
const catchAsync  = require('../utils/catchAsync');
const { verifyAccessToken } = require('../utils/jwtUtils');
const User        = require('../models/User');

/**
 * protect — verifies the JWT access token in the Authorization header.
 * Sets req.user on success. Called before any protected route.
 */
const protect = catchAsync(async (req, _res, next) => {
  // 1. Extract token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please authenticate.', 401));
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3. Check user still exists
  const user = await User.findById(decoded.id).select('+isActive');
  if (!user || !user.isActive) {
    return next(new AppError('The account belonging to this token no longer exists.', 401));
  }

  // 4. Attach user to request
  req.user = user;
  next();
});

/**
 * restrictTo — role-based access control.
 * Must be used after protect.
 *
 * Usage: router.delete('/post/:id', protect, restrictTo('admin'), deletePost)
 */
const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
