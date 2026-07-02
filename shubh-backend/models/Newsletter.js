'use strict';

const mongoose = require('mongoose');
const crypto   = require('crypto');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Double opt-in token
    confirmToken:   { type: String, select: false },
    confirmExpires: { type: Date,   select: false },
    // Unsubscribe token — persistent
    unsubscribeToken: {
      type: String,
      select: false,
    },
    subscribedAt: {
      type: Date,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      enum: ['website', 'admin', 'import'],
      default: 'website',
    },
  },
  { timestamps: true }
);

newsletterSchema.index({ isActive: 1, isVerified: 1 });

// ── Pre-save: generate unsubscribe token on first save ─────────────────────────
newsletterSchema.pre('save', function (next) {
  if (this.isNew) {
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// ── Method: generate confirm token ────────────────────────────────────────────
newsletterSchema.methods.generateConfirmToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.confirmToken   = crypto.createHash('sha256').update(token).digest('hex');
  this.confirmExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

module.exports = mongoose.model('Newsletter', newsletterSchema);
