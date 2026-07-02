'use strict';

const crypto       = require('crypto');
const Newsletter   = require('../models/Newsletter');
const catchAsync   = require('../utils/catchAsync');
const AppError     = require('../utils/AppError');
const { sendSuccess, paginationMeta } = require('../utils/apiResponse');
const { sendNewsletterConfirm } = require('../services/emailService');

// ── POST /api/newsletter/subscribe ───────────────────────────────────────────
exports.subscribe = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;

  let subscriber = await Newsletter.findOne({ email }).select('+confirmToken +confirmExpires');

  if (subscriber) {
    if (subscriber.isActive && subscriber.isVerified) {
      return next(new AppError('This email is already subscribed.', 409));
    }
    // Re-subscribe or resend confirm
    subscriber.isActive = true;
  } else {
    subscriber = new Newsletter({ email, name });
  }

  const confirmToken = subscriber.generateConfirmToken();
  await subscriber.save();

  const confirmUrl = `${process.env.CLIENT_URL}/newsletter/confirm/${confirmToken}`;

  await sendNewsletterConfirm({ email, name, confirmUrl });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Check your email to confirm your subscription.',
  });
});

// ── GET /api/newsletter/confirm/:token ───────────────────────────────────────
exports.confirmSubscription = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const subscriber = await Newsletter.findOne({
    confirmToken:   hashedToken,
    confirmExpires: { $gt: Date.now() },
  }).select('+confirmToken +confirmExpires');

  if (!subscriber) {
    return next(new AppError('Invalid or expired confirmation link.', 400));
  }

  subscriber.isVerified      = true;
  subscriber.subscribedAt    = new Date();
  subscriber.confirmToken    = undefined;
  subscriber.confirmExpires  = undefined;
  await subscriber.save();

  sendSuccess(res, { message: 'Email confirmed. You are now subscribed!' });
});

// ── DELETE /api/newsletter/unsubscribe/:token ─────────────────────────────────
exports.unsubscribe = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findOne({
    unsubscribeToken: req.params.token,
  }).select('+unsubscribeToken');

  if (!subscriber) {
    return next(new AppError('Invalid unsubscribe link.', 400));
  }

  subscriber.isActive        = false;
  subscriber.unsubscribedAt  = new Date();
  await subscriber.save();

  sendSuccess(res, { message: 'You have been unsubscribed.' });
});

// ── GET /api/newsletter (admin) ───────────────────────────────────────────────
exports.getAllSubscribers = catchAsync(async (req, res, _next) => {
  const { page = 1, limit = 20, verified } = req.query;

  const filter = {};
  if (verified !== undefined) {
    filter.isVerified = verified === 'true';
    filter.isActive   = true;
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Newsletter.countDocuments(filter);

  const subscribers = await Newsletter.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  sendSuccess(res, {
    data: { subscribers },
    meta: paginationMeta(page, limit, total),
  });
});

// ── GET /api/newsletter/stats (admin) ─────────────────────────────────────────
exports.getStats = catchAsync(async (req, res, _next) => {
  const [total, verified, active] = await Promise.all([
    Newsletter.countDocuments(),
    Newsletter.countDocuments({ isVerified: true }),
    Newsletter.countDocuments({ isActive: true, isVerified: true }),
  ]);

  sendSuccess(res, { data: { total, verified, active, unverified: total - verified } });
});
