'use strict';

const express = require('express');
const router  = express.Router();
const commentController = require('../controllers/comment.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { commentLimiter }      = require('../middleware/rateLimiter');

// ── Public routes ──────────────────────────────────────────────────────────────
// GET  /api/comments/:postId        — list approved comments
// POST /api/comments/:postId        — submit a comment (rate-limited)
router.get('/:postId',  commentController.getComments);
router.post('/:postId', commentLimiter, commentController.createComment);

// ── Comment actions (email-verified, no login needed) ──────────────────────────
router.patch('/:id/like',   commentController.likeComment);
router.put('/:id',          commentController.editComment);
router.delete('/:id',       commentController.deleteComment);

// ── Admin routes ───────────────────────────────────────────────────────────────
router.use(protect, restrictTo('admin'));
router.get('/admin/all',            commentController.adminGetComments);
router.get('/admin/stats',          commentController.adminGetStats);
router.patch('/admin/:id/status',   commentController.adminUpdateStatus);
router.delete('/admin/:id',         commentController.adminDeleteComment);

module.exports = router;
