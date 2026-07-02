'use strict';

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    longDescription: {
      type: String,
      default: '',
    },
    techStack: {
      type: [String],
      required: [true, 'Tech stack is required'],
    },
    thumbnail: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    screenshots: [
      {
        url:      { type: String },
        publicId: { type: String },
        caption:  { type: String, default: '' },
      },
    ],
    liveUrl:  { type: String, default: '' },
    repoUrl:  { type: String, default: '' },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'archived', 'wip'],
      default: 'active',
    },
    order: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['fullstack', 'frontend', 'backend', 'mobile', 'other'],
      default: 'fullstack',
    },
  },
  { timestamps: true }
);

projectSchema.index({ featured: 1, order: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
