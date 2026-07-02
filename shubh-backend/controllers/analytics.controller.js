'use strict';

const Post       = require('../models/Post');
const Analytics  = require('../models/Analytics');
const Contact    = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

exports.getOverview = catchAsync(async (req, res, _next) => {
  const [
    totalPosts,
    publishedPosts,
    totalViews,
    totalMessages,
    unreadMessages,
    totalSubscribers,
  ] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: 'published' }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Contact.countDocuments(),
    Contact.countDocuments({ isRead: false }),
    Newsletter.countDocuments({ isActive: true, isVerified: true }),
  ]);

  sendSuccess(res, {
    data: {
      posts:       { total: totalPosts, published: publishedPosts, draft: totalPosts - publishedPosts },
      views:       totalViews[0]?.total || 0,
      messages:    { total: totalMessages, unread: unreadMessages },
      subscribers: totalSubscribers,
    },
  });
});

exports.getPostsAnalytics = catchAsync(async (req, res, _next) => {
  const posts = await Post.find({ status: 'published' })
    .select('title slug views readTime publishedAt')
    .sort('-views')
    .limit(10)
    .lean();

  sendSuccess(res, { data: { topPosts: posts } });
});

exports.getVisitorAnalytics = catchAsync(async (req, res, _next) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));
  const sinceStr = since.toISOString().split('T')[0];

  const data = await Analytics.aggregate([
    { $match: { date: { $gte: sinceStr } } },
    { $group: { _id: '$date', views: { $sum: '$views' } } },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', views: 1, _id: 0 } },
  ]);

  sendSuccess(res, { data: { analytics: data } });
});
