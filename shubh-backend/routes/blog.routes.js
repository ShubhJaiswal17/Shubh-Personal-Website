'use strict';

const express = require('express');
const router  = express.Router();

const blogController = require('../controllers/blog.controller');
const { protect, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPostSchema, updatePostSchema } = require('../validators/schemas');

// Public routes
router.get('/',            blogController.getAllPosts);
router.get('/search',      blogController.searchPosts);
router.get('/tags',        blogController.getAllTags);
router.get('/featured',    blogController.getFeaturedPosts);
router.get('/:slug',       blogController.getPostBySlug);
router.get('/:id/related', blogController.getRelatedPosts);

// Semi-public (view increment — no auth required but attached if present)
router.patch('/:id/view',  blogController.incrementView);

// Admin only
router.use(protect, requirePermission('managePosts'));
router.post('/',     validate(createPostSchema), blogController.createPost);
router.put('/:id',   validate(updatePostSchema), blogController.updatePost);
router.delete('/:id',                            blogController.deletePost);

module.exports = router;
