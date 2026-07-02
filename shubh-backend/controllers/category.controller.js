'use strict';

const Category   = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError   = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// ── GET /api/categories ───────────────────────────────────────────────────────
exports.getAllCategories = catchAsync(async (req, res, _next) => {
  const filter = {};
  if (req.user?.role !== 'admin') filter.isActive = true;

  const categories = await Category.find(filter).sort('name').lean();
  sendSuccess(res, { data: { categories } });
});

// ── GET /api/categories/:slug ─────────────────────────────────────────────────
exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return next(new AppError('Category not found.', 404));
  sendSuccess(res, { data: { category } });
});

// ── POST /api/categories (admin) ──────────────────────────────────────────────
exports.createCategory = catchAsync(async (req, res, _next) => {
  const category = await Category.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Category created.', data: { category } });
});

// ── PUT /api/categories/:id (admin) ───────────────────────────────────────────
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new AppError('Category not found.', 404));
  sendSuccess(res, { message: 'Category updated.', data: { category } });
});

// ── DELETE /api/categories/:id (admin) ────────────────────────────────────────
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError('Category not found.', 404));
  sendSuccess(res, { statusCode: 204, message: 'Category deleted.' });
});
