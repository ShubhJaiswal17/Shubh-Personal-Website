'use strict';

const Contact    = require('../models/Contact');
const catchAsync = require('../utils/catchAsync');
const AppError   = require('../utils/AppError');
const { sendSuccess, paginationMeta } = require('../utils/apiResponse');
const { sendContactNotification } = require('../services/emailService');

exports.sendMessage = catchAsync(async (req, res, _next) => {
  const { name, email, subject, message } = req.body;

  const contact = await Contact.create({
    name, email, subject, message,
    ip: req.ip,
  });

  // Fire email notification (non-blocking)
  sendContactNotification({ name, email, subject, message }).catch((err) => {
    console.error('Email notification failed:', err.message);
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Message sent. I will get back to you soon!',
    data: { id: contact._id },
  });
});

exports.getAllMessages = catchAsync(async (req, res, _next) => {
  const { page = 1, limit = 20, read } = req.query;
  const filter = {};
  if (read !== undefined) filter.isRead = read === 'true';

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Contact.countDocuments(filter);

  const messages = await Contact.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  sendSuccess(res, {
    data: { messages },
    meta: paginationMeta(page, limit, total),
  });
});

exports.markRead = catchAsync(async (req, res, next) => {
  const message = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!message) return next(new AppError('Message not found.', 404));
  sendSuccess(res, { message: 'Marked as read.', data: { message } });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Contact.findByIdAndDelete(req.params.id);
  if (!message) return next(new AppError('Message not found.', 404));
  sendSuccess(res, { statusCode: 204, message: 'Message deleted.' });
});
