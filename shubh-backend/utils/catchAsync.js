'use strict';

/**
 * Wraps an async controller function and forwards any
 * rejected promise to Express's next(err) error handler.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
