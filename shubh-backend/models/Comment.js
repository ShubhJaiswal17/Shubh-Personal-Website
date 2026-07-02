'use strict';

const mongoose = require('mongoose');

/**
 * Comment model — supports:
 *  - Top-level comments on posts
 *  - One level of nested replies (parentId → null means top-level)
 *  - Per-comment likes (array of IPs to avoid duplicates without auth)
 *  - Moderation states: pending / approved / rejected / spam
 *  - Soft-delete via isDeleted flag (keeps reply thread structure intact)
 *  - Basic spam signals: honeypot field + link count
 */
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Post',
      required: true,
      index: true,
    },

    // null = top-level comment, ObjectId = reply to that comment
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Comment',
      default: null,
    },

    // Author info (no account needed — guest comments)
    author: {
      name:  { type: String, required: true, trim: true, maxlength: 60 },
      email: { type: String, required: true, lowercase: true, trim: true },
      // Avatar via Gravatar hash — never store email publicly
      avatarHash: { type: String },
    },

    content: {
      type:      String,
      required:  true,
      maxlength: 2000,
      trim:      true,
    },

    // Moderation
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
    },

    // Likes: stored as hashed IPs so same visitor can't like twice
    // No auth required to like
    likes: {
      type:    [String],   // hashed IP strings
      default: [],
    },

    // Soft-delete — keeps reply tree intact
    isDeleted: {
      type:    Boolean,
      default: false,
    },

    // Spam signals
    spamScore: {
      type:    Number,
      default: 0,
    },

    // Honeypot — bots fill this, humans leave it empty
    honeypot: {
      type:   String,
      select: false,
    },

    // Edit tracking
    editedAt: { type: Date },
    isEdited: { type: Boolean, default: false },

    // IP for spam/rate-limiting (never exposed in public responses)
    ip: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
commentSchema.index({ post: 1, status: 1, createdAt: -1 });
commentSchema.index({ post: 1, parentId: 1, status: 1 });
commentSchema.index({ 'author.email': 1 });

// ── Virtual: like count ────────────────────────────────────────────────────────
commentSchema.virtual('likeCount').get(function () {
  return this.likes?.length || 0;
});

// ── Virtual: reply count (populated separately when needed) ───────────────────
commentSchema.virtual('replies', {
  ref:          'Comment',
  localField:   '_id',
  foreignField: 'parentId',
});

// ── Pre-save: generate Gravatar hash from email ────────────────────────────────
commentSchema.pre('save', function (next) {
  if (this.isModified('author.email') && this.author?.email) {
    // Simple MD5-like hash using built-in crypto
    const crypto = require('crypto');
    this.author.avatarHash = crypto
      .createHash('md5')
      .update(this.author.email.toLowerCase().trim())
      .digest('hex');
  }
  next();
});

// ── Pre-save: basic spam scoring ───────────────────────────────────────────────
commentSchema.pre('save', function (next) {
  if (!this.isModified('content')) return next();

  let score = 0;

  // Honeypot filled = almost certainly a bot
  if (this.honeypot) score += 10;

  // Too many links
  const linkCount = (this.content.match(/https?:\/\//gi) || []).length;
  if (linkCount > 3) score += linkCount;

  // All caps
  const upper = (this.content.match(/[A-Z]/g) || []).length;
  const total = this.content.replace(/\s/g, '').length;
  if (total > 20 && upper / total > 0.7) score += 3;

  this.spamScore = score;
  if (score >= 10) this.status = 'spam';

  next();
});

module.exports = mongoose.model('Comment', commentSchema);
