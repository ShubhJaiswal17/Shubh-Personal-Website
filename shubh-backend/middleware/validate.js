'use strict';

const AppError = require('../utils/AppError');

/**
 * Factory: returns an Express middleware that validates req.body
 * against the provided Joi schema.
 *
 * Usage: router.post('/posts', protect, validate(postSchema), createPost)
 */
const validate = (schema) => (req, _res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,   // collect all errors, not just the first
    stripUnknown: true,  // remove unknown fields from req.body
    allowUnknown: false,
  });

  if (error) {
    const message = error.details
      .map((d) => d.message.replaceAll('"', "'"))
      .join('; ');
    return next(new AppError(message, 400));
  }

  next();
};

module.exports = validate;
