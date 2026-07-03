'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    // ── Granular RBAC permissions (toggle with 1/0) ─────────────────────────────
    permissions: {
      managePosts:      { type: Boolean, default: false },
      manageCategories: { type: Boolean, default: false },
      manageProjects:   { type: Boolean, default: false },
      manageComments:   { type: Boolean, default: false },
      manageNewsletter: { type: Boolean, default: false },
      manageMessages:   { type: Boolean, default: false },
      viewAnalytics:    { type: Boolean, default: false },
      manageUsers:      { type: Boolean, default: false },
    },
    // Hashed refresh tokens — supports multiple devices
    refreshTokens: {
      type: [String],
      select: false,
    },
    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Pre-save hook: hash password ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: create password reset token ───────────────────────────────
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// ── Instance method: add hashed refresh token ─────────────────────────────────
userSchema.methods.addRefreshToken = async function (token) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  this.refreshTokens.push(hashed);
  // Keep only the 5 most recent refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  await this.save({ validateBeforeSave: false });
};

// ── Instance method: remove a refresh token ────────────────────────────────────
userSchema.methods.removeRefreshToken = async function (token) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  this.refreshTokens = this.refreshTokens.filter((t) => t !== hashed);
  await this.save({ validateBeforeSave: false });
};

// ── Instance method: check if token exists ─────────────────────────────────────
userSchema.methods.hasRefreshToken = function (token) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  return this.refreshTokens.includes(hashed);
};

module.exports = mongoose.model('User', userSchema);
