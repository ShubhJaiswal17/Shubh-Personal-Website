'use strict';

const express = require('express');
const router  = express.Router();

const categoryController = require('../controllers/category.controller');
const { protect, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/schemas');

// Public
router.get('/',       categoryController.getAllCategories);
router.get('/:slug',  categoryController.getCategoryBySlug);

// Admin only
router.use(protect, requirePermission('manageCategories'));
router.post('/',     validate(createCategorySchema), categoryController.createCategory);
router.put('/:id',   validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id',                                categoryController.deleteCategory);

module.exports = router;
