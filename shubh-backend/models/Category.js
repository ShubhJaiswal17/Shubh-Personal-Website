'use strict';

const mongoose = require('mongoose');
const slugify  = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#8B0000',
      match: [/^#([A-Fa-f0-9]{6})$/, 'Provide a valid hex color'],
    },
    icon: {
      type: String,
      default: '',
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── Auto-generate slug ─────────────────────────────────────────────────────────
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});


module.exports = mongoose.model('Category', categorySchema);
