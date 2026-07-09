'use strict';

const express = require('express');
const router  = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All analytics routes are admin-only
router.use(protect, restrictTo('admin'));

router.get('/overview',  analyticsController.getOverview);
router.get('/posts',     analyticsController.getPostsAnalytics);
router.get('/visitors',  analyticsController.getVisitorAnalytics);

module.exports = router;
