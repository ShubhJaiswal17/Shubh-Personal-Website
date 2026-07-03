'use strict';

const express = require('express');
const router  = express.Router();

const newsletterController = require('../controllers/newsletter.controller');
const { protect, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { subscribeSchema } = require('../validators/schemas');
const { newsletterLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/subscribe',          newsletterLimiter, validate(subscribeSchema), newsletterController.subscribe);
router.get('/confirm/:token',                                                    newsletterController.confirmSubscription);
router.delete('/unsubscribe/:token',                                             newsletterController.unsubscribe);

// Admin only
router.use(protect, requirePermission('manageNewsletter'));
router.get('/',       newsletterController.getAllSubscribers);
router.get('/stats',  newsletterController.getStats);

module.exports = router;
