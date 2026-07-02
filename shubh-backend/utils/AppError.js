'use strict';

/**
 * AppError — operational errors with HTTP status codes.
 * These are "expected" errors (400, 401, 403, 404, etc.)
 * Distinguished from programming errors by isOperational = true.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode  = statusCode;
    this.status      = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
