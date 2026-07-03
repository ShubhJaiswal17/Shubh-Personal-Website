'use strict';

const jwt    = require('jsonwebtoken');
const config = require('../config/jwt');

/**
 * Sign a short-lived access token (15 min).
 * Payload: id + role + permissions.
 */
const signAccessToken = (userId, role, permissions = {}) => {
  return jwt.sign(
    { id: userId, role, permissions },
    config.access.secret,
    { expiresIn: config.access.expiresIn }
  );
};

/**
 * Sign a long-lived refresh token (7 days).
 */
const signRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.refresh.secret,
    { expiresIn: config.refresh.expiresIn }
  );
};

/**
 * Verify an access token. Returns decoded payload or throws.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.access.secret);
};

/**
 * Verify a refresh token. Returns decoded payload or throws.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.refresh.secret);
};

/**
 * Set the refresh token as an httpOnly cookie on the response.
 */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, config.cookieOptions);
};

/**
 * Clear the refresh token cookie.
 */
const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};
