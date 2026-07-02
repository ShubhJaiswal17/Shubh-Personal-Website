'use strict';

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    views:          { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    referrers: [
      {
        source: String,
        count:  { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

analyticsSchema.index({ post: 1, date: 1 }, { unique: true });
analyticsSchema.index({ date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
