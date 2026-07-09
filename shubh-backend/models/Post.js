'use strict';

const mongoose = require('mongoose');
const slugify  = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      url:       { type: String, default: '' },
      publicId:  { type: String, default: '' }, // Cloudinary public ID
      alt:       { type: String, default: '' },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'A post can have at most 10 tags',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // minutes, auto-calculated
      default: 1,
    },
    // SEO
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title cannot exceed 70 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ category: 1 });
postSchema.index({ featured: 1, status: 1 });
// Full-text search index
postSchema.index(
  { title: 'text', excerpt: 'text', content: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, excerpt: 3, content: 1 }, name: 'PostTextIndex' }
);

// ── Pre-save: slug + readTime + publishedAt ────────────────────────────────────
postSchema.pre('save', async function (next) {
  // Slug
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.model('Post').exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  // Reading time: avg 200 words/min
  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Set publishedAt when first published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ── Virtual: URL ───────────────────────────────────────────────────────────────
postSchema.virtual('url').get(function () {
  return `/blog/${this.slug}`;
});

module.exports = mongoose.model('Post', postSchema);
