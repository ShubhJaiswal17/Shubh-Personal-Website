'use strict';

const express = require('express');
const router  = express.Router();

const authController = require('../controllers/auth.controller');
const { protect }    = require('../middleware/auth');
const validate       = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validators/schemas');

// Public
router.post('/register',      authLimiter, validate(registerSchema), authController.register);
router.post('/login',         authLimiter, validate(loginSchema),    authController.login);
router.post('/refresh',                                               authController.refresh);
router.post('/create-admin',  authLimiter,                           authController.createAdmin);

// Protected
router.use(protect);
router.post('/logout',                                       authController.logout);
router.get('/me',                                            authController.getMe);
router.patch('/me',                                          authController.updateMe);
router.patch('/change-password', validate(changePasswordSchema), authController.changePassword);

module.exports = router;
