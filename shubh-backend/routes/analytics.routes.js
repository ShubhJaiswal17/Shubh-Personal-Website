'use strict';

const express = require('express');
const router  = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { protect, requirePermission } = require('../middleware/auth');

// All analytics routes are admin-only
router.use(protect, requirePermission('viewAnalytics'));

router.get('/overview',  analyticsController.getOverview);
router.get('/posts',     analyticsController.getPostsAnalytics);
router.get('/visitors',  analyticsController.getVisitorAnalytics);

module.exports = router;
