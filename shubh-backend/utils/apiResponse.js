'use strict';

/**
 * Standardised API response helpers.
 * All endpoints use these to ensure consistent shape:
 * { success, message, data?, meta? }
 */

const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendError = (res, { statusCode = 500, message = 'An error occurred' }) => {
  return res.status(statusCode).json({ success: false, message });
};

/**
 * Build pagination meta from mongoose query results.
 * @param {number} page  - current page (1-indexed)
 * @param {number} limit - items per page
 * @param {number} total - total document count
 */
const paginationMeta = (page, limit, total) => ({
  page:       parseInt(page),
  limit:      parseInt(limit),
  total,
  totalPages: Math.ceil(total / limit),
  hasNext:    page * limit < total,
  hasPrev:    page > 1,
});

module.exports = { sendSuccess, sendError, paginationMeta };
