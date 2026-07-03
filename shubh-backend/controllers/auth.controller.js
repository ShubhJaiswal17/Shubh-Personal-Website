'use strict';

const crypto   = require('crypto');
const User     = require('../models/User');
const catchAsync   = require('../utils/catchAsync');
const AppError     = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../utils/jwtUtils');

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  // Only allow admin registration via a secret header in dev
  // In production, create the admin manually or via seed script
  const role = 'user';

  const user = await User.create({ name, email, password, role });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Account created successfully.',
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Include password (select: false by default)
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  const accessToken  = signAccessToken(user._id, user.role, user.permissions);
  const refreshToken = signRefreshToken(user._id);

  // Store hashed refresh token
  await user.addRefreshToken(refreshToken);

  // Set refresh token in httpOnly cookie
  setRefreshCookie(res, refreshToken);

  sendSuccess(res, {
    message: 'Logged in successfully.',
    data: {
      accessToken,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar,
        permissions: user.permissions,
      },
    },
  });
});

// ── Refresh access token ──────────────────────────────────────────────────────
exports.refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return next(new AppError('No refresh token provided.', 401));
  }

  // Verify the JWT
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  // Find user and check token exists (rotation check)
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.hasRefreshToken(token)) {
    // Possible token reuse — clear all tokens (security measure)
    if (user) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
    }
    clearRefreshCookie(res);
    return next(new AppError('Refresh token reuse detected. Please log in again.', 401));
  }

  // Rotate: remove old, issue new
  await user.removeRefreshToken(token);
  const newRefreshToken = signRefreshToken(user._id);
  await user.addRefreshToken(newRefreshToken);
  setRefreshCookie(res, newRefreshToken);

  const accessToken = signAccessToken(user._id, user.role, user.permissions);

  sendSuccess(res, {
    message: 'Token refreshed.',
    data: { accessToken },
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = catchAsync(async (req, res, _next) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    const user = await User.findById(req.user?._id).select('+refreshTokens');
    if (user) await user.removeRefreshToken(token);
  }

  clearRefreshCookie(res);

  sendSuccess(res, { message: 'Logged out successfully.' });
});

// ── Get current user (me) ─────────────────────────────────────────────────────
exports.getMe = catchAsync(async (req, res, _next) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, {
    data: { user },
  });
});

// ── Update profile ────────────────────────────────────────────────────────────
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.role) {
    return next(new AppError('This route is not for password or role updates.', 400));
  }

  const allowedFields = ['name', 'bio', 'avatar'];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, { message: 'Profile updated.', data: { user } });
});

// ── Change password ───────────────────────────────────────────────────────────
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  user.password = newPassword;
  await user.save();

  // Invalidate all refresh tokens (force re-login on all devices)
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });
  clearRefreshCookie(res);

  sendSuccess(res, { message: 'Password changed. Please log in again.' });
});

// ── Admin: create admin user ──────────────────────────────────────────────────
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, adminSecret } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return next(new AppError('Invalid admin secret.', 403));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('Email already in use.', 409));

  const allPerms = {
    managePosts: true, manageCategories: true, manageProjects: true,
    manageComments: true, manageNewsletter: true, manageMessages: true,
    viewAnalytics: true, manageUsers: true,
  };

  const admin = await User.create({ name, email, password, role: 'admin', permissions: allPerms });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Admin account created.',
    data: { id: admin._id, email: admin.email, role: admin.role, permissions: admin.permissions },
  });
});
