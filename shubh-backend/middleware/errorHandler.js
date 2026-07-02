'use strict';

const AppError = require('../utils/AppError');

// ── Error type handlers ─────────────────────────────────────────────────────────

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Duplicate value "${value}" for field "${field}". Please use a different value.`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation failed: ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ── Response senders ───────────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status:  err.status,
    message: err.message,
    stack:   err.stack,
    error:   err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational errors: send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming / unknown errors: don't leak details
  console.error('PROGRAMMING ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};

// ── Main error handler ─────────────────────────────────────────────────────────

module.exports = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status     = err.status     || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  // Production: classify known Mongoose/JWT errors
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);

  if (error.name === 'CastError')            error = handleCastErrorDB(error);
  if (error.code === 11000)                  error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError')      error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError')    error = handleJWTError();
  if (error.name === 'TokenExpiredError')    error = handleJWTExpiredError();

  sendErrorProd(error, res);
};
