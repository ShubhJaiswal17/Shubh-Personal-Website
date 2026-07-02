'use strict';

const Post     = require('../models/Post');
const Category = require('../models/Category');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const AppError   = require('../utils/AppError');
const { sendSuccess, paginationMeta } = require('../utils/apiResponse');

// ── GET /api/blog  — List published posts with filtering, sorting, pagination ──
exports.getAllPosts = catchAsync(async (req, res, _next) => {
  const {
    page = 1,
    limit = 10,
    sort = '-publishedAt',
    category,
    tag,
    featured,
    status = 'published',
  } = req.query;

  // Only admins can see non-published posts
  const isAdmin = req.user?.role === 'admin';
  const filter = {};

  if (isAdmin && req.query.status) {
    filter.status = status;
  } else {
    filter.status = 'published';
  }

  if (category) filter.category = category;
  if (tag)      filter.tags = { $in: [tag.toLowerCase()] };
  if (featured !== undefined) filter.featured = featured === 'true';

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter)
    .populate('author', 'name avatar')
    .populate('category', 'name slug color')
    .select('-content')          // Exclude heavy content from list view
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  sendSuccess(res, {
    data: { posts },
    meta: paginationMeta(page, limit, total),
  });
});

// ── GET /api/blog/:slug  — Single post by slug ────────────────────────────────
exports.getPostBySlug = catchAsync(async (req, res, next) => {
  const filter = { slug: req.params.slug };

  // Non-admins can only see published posts
  if (req.user?.role !== 'admin') filter.status = 'published';

  const post = await Post.findOne(filter)
    .populate('author', 'name avatar bio')
    .populate('category', 'name slug color');

  if (!post) return next(new AppError('Post not found.', 404));

  sendSuccess(res, { data: { post } });
});

// ── PATCH /api/blog/:id/view  — Increment view count ─────────────────────────
exports.incrementView = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!post) return next(new AppError('Post not found.', 404));

  // Track in analytics collection (upsert for today)
  const today = new Date().toISOString().split('T')[0];
  await Analytics.findOneAndUpdate(
    { post: post._id, date: today },
    { $inc: { views: 1 } },
    { upsert: true, new: true }
  );

  sendSuccess(res, { message: 'View recorded.', data: { views: post.views } });
});

// ── POST /api/blog  — Create post (admin) ─────────────────────────────────────
exports.createPost = catchAsync(async (req, res, _next) => {
  const post = await Post.create({ ...req.body, author: req.user._id });

  // Increment category post count
  if (post.category) {
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: 1 } });
  }

  sendSuccess(res, {
    statusCode: 201,
    message: 'Post created successfully.',
    data: { post },
  });
});

// ── PUT /api/blog/:id  — Update post (admin) ──────────────────────────────────
exports.updatePost = catchAsync(async (req, res, next) => {
  const existingPost = await Post.findById(req.params.id);
  if (!existingPost) return next(new AppError('Post not found.', 404));

  // Handle category postCount if category changed
  if (req.body.category && String(req.body.category) !== String(existingPost.category)) {
    if (existingPost.category) {
      await Category.findByIdAndUpdate(existingPost.category, { $inc: { postCount: -1 } });
    }
    await Category.findByIdAndUpdate(req.body.category, { $inc: { postCount: 1 } });
  }

  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, { message: 'Post updated.', data: { post } });
});

// ── DELETE /api/blog/:id  — Delete post (admin) ───────────────────────────────
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return next(new AppError('Post not found.', 404));

  // Decrement category postCount
  if (post.category) {
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });
  }

  sendSuccess(res, { statusCode: 204, message: 'Post deleted.' });
});

// ── GET /api/blog/search?q=  — Full-text search ───────────────────────────────
exports.searchPosts = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters.', 400));
  }

  const filter = {
    status: 'published',
    $text: { $search: q },
  };

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Post.countDocuments(filter);

  const posts = await Post.find(filter, { score: { $meta: 'textScore' } })
    .populate('author', 'name avatar')
    .populate('category', 'name slug color')
    .select('-content')
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  sendSuccess(res, {
    data: { posts, query: q },
    meta: paginationMeta(page, limit, total),
  });
});

// ── GET /api/blog/tags  — All unique tags with counts ─────────────────────────
exports.getAllTags = catchAsync(async (req, res, _next) => {
  const tags = await Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { tag: '$_id', count: 1, _id: 0 } },
  ]);

  sendSuccess(res, { data: { tags } });
});

// ── GET /api/blog/featured  — Featured posts ──────────────────────────────────
exports.getFeaturedPosts = catchAsync(async (req, res, _next) => {
  const posts = await Post.find({ status: 'published', featured: true })
    .populate('author', 'name avatar')
    .populate('category', 'name slug color')
    .select('-content')
    .sort('-publishedAt')
    .limit(6)
    .lean();

  sendSuccess(res, { data: { posts } });
});

// ── GET /api/blog/:id/related  — Related posts by tags/category ───────────────
exports.getRelatedPosts = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError('Post not found.', 404));

  const related = await Post.find({
    _id: { $ne: post._id },
    status: 'published',
    $or: [
      { tags: { $in: post.tags } },
      { category: post.category },
    ],
  })
    .populate('author', 'name avatar')
    .populate('category', 'name slug color')
    .select('-content')
    .sort('-publishedAt')
    .limit(3)
    .lean();

  sendSuccess(res, { data: { posts: related } });
});
