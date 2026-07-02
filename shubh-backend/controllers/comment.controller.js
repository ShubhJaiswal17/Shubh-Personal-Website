'use strict';

const crypto     = require('crypto');
const Comment    = require('../models/Comment');
const Post       = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const AppError   = require('../utils/AppError');
const { sendSuccess, paginationMeta } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────────────────────────────
const hashIP = (ip) =>
  crypto.createHash('sha256').update(ip || '0.0.0.0').digest('hex');

// Fields safe to return in public responses
const PUBLIC_FIELDS = 'author.name author.avatarHash content status parentId post likes isDeleted isEdited editedAt createdAt updatedAt';

// ── GET /api/comments/:postId ─ list approved comments for a post ──────────────
exports.getComments = catchAsync(async (req, res, _next) => {
  const { postId } = req.params;
  const { sort = 'newest', page = 1, limit = 20 } = req.query;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt:  1 },
    liked:  { likeCount: -1, createdAt: -1 },
  };
  const sortObj = sortMap[sort] || sortMap.newest;

  // Only fetch top-level comments here; replies fetched separately or nested
  const filter = {
    post:     postId,
    parentId: null,
    status:   'approved',
    isDeleted: false,
  };

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .select(PUBLIC_FIELDS)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Attach replies to each top-level comment (1 extra query, avoids N+1)
  const ids = comments.map((c) => c._id);
  const replies = await Comment.find({
    post:     postId,
    parentId: { $in: ids },
    status:   'approved',
    isDeleted: false,
  })
    .select(PUBLIC_FIELDS)
    .sort({ createdAt: 1 })
    .lean();

  // Group replies by parentId
  const replyMap = {};
  replies.forEach((r) => {
    const key = String(r.parentId);
    if (!replyMap[key]) replyMap[key] = [];
    replyMap[key].push({ ...r, likeCount: r.likes?.length || 0 });
  });

  const enriched = comments.map((c) => ({
    ...c,
    likeCount: c.likes?.length || 0,
    replies:   replyMap[String(c._id)] || [],
  }));

  sendSuccess(res, {
    data: { comments: enriched },
    meta: paginationMeta(page, limit, total),
  });
});

// ── POST /api/comments/:postId ─ create a new comment ─────────────────────────
exports.createComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { name, email, content, parentId, honeypot } = req.body;

  // Verify post exists
  const post = await Post.findById(postId).select('_id');
  if (!post) return next(new AppError('Post not found.', 404));

  // Spam: honeypot filled
  if (honeypot) {
    // Silently appear to succeed (bot deterrence)
    return sendSuccess(res, { statusCode: 201, message: 'Comment submitted.' });
  }

  // If parentId given, verify parent exists and belongs to same post
  if (parentId) {
    const parent = await Comment.findById(parentId).select('post parentId');
    if (!parent || String(parent.post) !== String(postId)) {
      return next(new AppError('Parent comment not found.', 404));
    }
    // Only 1 level of nesting allowed
    if (parent.parentId !== null) {
      return next(new AppError('Replies to replies are not supported.', 400));
    }
  }

  const comment = await Comment.create({
    post:     postId,
    parentId: parentId || null,
    author:   { name, email },
    content,
    honeypot,
    ip: req.ip,
  });

  // Return only safe fields
  const safe = {
    _id:       comment._id,
    post:      comment.post,
    parentId:  comment.parentId,
    author:    { name: comment.author.name, avatarHash: comment.author.avatarHash },
    content:   comment.content,
    status:    comment.status,
    likeCount: 0,
    createdAt: comment.createdAt,
  };

  sendSuccess(res, {
    statusCode: 201,
    message: comment.status === 'approved'
      ? 'Comment posted!'
      : 'Comment submitted and awaiting approval.',
    data: { comment: safe },
  });
});

// ── PATCH /api/comments/:id/like ─ toggle like on a comment ───────────────────
exports.likeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).select('+likes');
  if (!comment || comment.status !== 'approved') {
    return next(new AppError('Comment not found.', 404));
  }

  const hash = hashIP(req.ip);
  const idx  = comment.likes.indexOf(hash);
  let liked;

  if (idx === -1) {
    comment.likes.push(hash);
    liked = true;
  } else {
    comment.likes.splice(idx, 1);
    liked = false;
  }

  await comment.save({ validateBeforeSave: false });

  sendSuccess(res, {
    data: { liked, likeCount: comment.likes.length },
  });
});

// ── PUT /api/comments/:id ─ edit own comment (by email match) ─────────────────
exports.editComment = catchAsync(async (req, res, next) => {
  const { content, email } = req.body;

  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.isDeleted) return next(new AppError('Comment not found.', 404));

  // Verify ownership by email (no auth — guests match by email)
  if (comment.author.email !== email.toLowerCase().trim()) {
    return next(new AppError('You can only edit your own comments.', 403));
  }

  // Only approved comments can be edited
  if (comment.status !== 'approved') {
    return next(new AppError('This comment cannot be edited.', 400));
  }

  comment.content  = content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  comment.status   = 'pending'; // Re-queue for moderation after edit
  await comment.save();

  sendSuccess(res, { message: 'Comment updated and pending re-approval.' });
});

// ── DELETE /api/comments/:id ─ soft-delete own comment ────────────────────────
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.isDeleted) return next(new AppError('Comment not found.', 404));

  // Verify ownership
  if (comment.author.email !== email.toLowerCase().trim()) {
    return next(new AppError('You can only delete your own comments.', 403));
  }

  // Soft-delete: replace content, keep thread structure
  comment.isDeleted = true;
  comment.content   = '[This comment has been deleted]';
  await comment.save({ validateBeforeSave: false });

  sendSuccess(res, { message: 'Comment deleted.' });
});

// ── ADMIN: GET /api/admin/comments ─ all comments with filters ────────────────
exports.adminGetComments = catchAsync(async (req, res, _next) => {
  const { status, page = 1, limit = 20, postId } = req.query;

  const filter = {};
  if (status)  filter.status = status;
  if (postId)  filter.post   = postId;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .populate('post', 'title slug')
    .select(`${PUBLIC_FIELDS} ip spamScore`)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  sendSuccess(res, {
    data: { comments: comments.map((c) => ({ ...c, likeCount: c.likes?.length || 0 })) },
    meta: paginationMeta(page, limit, total),
  });
});

// ── ADMIN: PATCH /api/admin/comments/:id/status ─ approve / reject / spam ─────
exports.adminUpdateStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const VALID = ['approved', 'rejected', 'spam', 'pending'];

  if (!VALID.includes(status)) {
    return next(new AppError(`Status must be one of: ${VALID.join(', ')}`, 400));
  }

  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!comment) return next(new AppError('Comment not found.', 404));

  sendSuccess(res, { message: `Comment ${status}.`, data: { comment } });
});

// ── ADMIN: DELETE /api/admin/comments/:id ─ hard delete ───────────────────────
exports.adminDeleteComment = catchAsync(async (req, res, next) => {
  // Also delete all replies
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new AppError('Comment not found.', 404));

  await Comment.deleteMany({ parentId: comment._id });
  await comment.deleteOne();

  sendSuccess(res, { statusCode: 204, message: 'Comment and replies deleted.' });
});

// ── ADMIN: GET /api/admin/comments/stats ──────────────────────────────────────
exports.adminGetStats = catchAsync(async (req, res, _next) => {
  const [pending, approved, spam, total] = await Promise.all([
    Comment.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'approved' }),
    Comment.countDocuments({ status: 'spam' }),
    Comment.countDocuments(),
  ]);

  sendSuccess(res, { data: { total, pending, approved, spam } });
});
