'use strict';

const express = require('express');
const router  = express.Router();

const contactController = require('../controllers/contact.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { contactSchema } = require('../validators/schemas');
const { contactLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/', contactLimiter, validate(contactSchema), contactController.sendMessage);

// Admin only
router.use(protect, restrictTo('admin'));
router.get('/',          contactController.getAllMessages);
router.patch('/:id/read', contactController.markRead);
router.delete('/:id',    contactController.deleteMessage);

module.exports = router;
