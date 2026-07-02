'use strict';

const Joi = require('joi');

// ── Auth ───────────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password',
  }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and a number',
    }),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// ── Post ──────────────────────────────────────────────────────────────────────

const createPostSchema = Joi.object({
  title:    Joi.string().trim().min(5).max(200).required(),
  excerpt:  Joi.string().trim().min(10).max(300).required(),
  content:  Joi.string().min(50).required(),
  category: Joi.string().hex().length(24).optional(),
  tags:     Joi.array().items(Joi.string().trim().lowercase()).max(10).default([]),
  status:   Joi.string().valid('draft', 'published', 'archived').default('draft'),
  featured: Joi.boolean().default(false),
  coverImage: Joi.object({
    url:      Joi.string().uri().allow('').optional(),
    publicId: Joi.string().allow('').optional(),
    alt:      Joi.string().max(200).allow('').optional(),
  }).optional(),
  metaTitle:       Joi.string().max(70).allow('').optional(),
  metaDescription: Joi.string().max(160).allow('').optional(),
});

const updatePostSchema = createPostSchema.fork(
  ['title', 'excerpt', 'content'],
  (field) => field.optional()
);

// ── Category ──────────────────────────────────────────────────────────────────

const createCategorySchema = Joi.object({
  name:        Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().max(200).allow('').optional(),
  color:       Joi.string().pattern(/^#([A-Fa-f0-9]{6})$/).default('#8B0000'),
  icon:        Joi.string().allow('').optional(),
  isActive:    Joi.boolean().default(true),
});

const updateCategorySchema = createCategorySchema.fork(['name'], (f) => f.optional());

// ── Project ───────────────────────────────────────────────────────────────────

const createProjectSchema = Joi.object({
  title:           Joi.string().trim().min(2).max(100).required(),
  description:     Joi.string().min(10).max(1000).required(),
  longDescription: Joi.string().allow('').optional(),
  techStack:       Joi.array().items(Joi.string()).min(1).required(),
  liveUrl:         Joi.string().uri().allow('').optional(),
  repoUrl:         Joi.string().uri().allow('').optional(),
  featured:        Joi.boolean().default(false),
  status:          Joi.string().valid('active', 'archived', 'wip').default('active'),
  order:           Joi.number().integer().min(0).default(0),
  category:        Joi.string().valid('fullstack', 'frontend', 'backend', 'mobile', 'other').default('fullstack'),
  thumbnail: Joi.object({
    url:      Joi.string().uri().allow('').optional(),
    publicId: Joi.string().allow('').optional(),
  }).optional(),
});

const updateProjectSchema = createProjectSchema.fork(
  ['title', 'description', 'techStack'],
  (f) => f.optional()
);

// ── Contact ───────────────────────────────────────────────────────────────────

const contactSchema = Joi.object({
  name:    Joi.string().trim().min(2).max(60).required(),
  email:   Joi.string().email().lowercase().required(),
  subject: Joi.string().trim().min(3).max(100).required(),
  message: Joi.string().trim().min(10).max(2000).required(),
});

// ── Newsletter ────────────────────────────────────────────────────────────────

const subscribeSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  name:  Joi.string().trim().max(60).allow('').optional(),
});

// ── Comments ──────────────────────────────────────────────────────────────────

const createCommentSchema = Joi.object({
  name:     Joi.string().trim().min(2).max(60).required().messages({
    'any.required': 'Name is required',
    'string.min':   'Name must be at least 2 characters',
  }),
  email:    Joi.string().email().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
  content:  Joi.string().trim().min(2).max(2000).required().messages({
    'any.required': 'Comment cannot be empty',
    'string.min':   'Comment must be at least 2 characters',
  }),
  parentId: Joi.string().hex().length(24).optional().allow(null),
  honeypot: Joi.string().allow('').optional(),
});

const editCommentSchema = Joi.object({
  content: Joi.string().trim().min(2).max(2000).required(),
  email:   Joi.string().email().lowercase().required(),
});

const deleteCommentSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const updateCommentStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'spam', 'pending').required(),
});

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  createPostSchema,
  updatePostSchema,
  createCategorySchema,
  updateCategorySchema,
  createProjectSchema,
  updateProjectSchema,
  contactSchema,
  subscribeSchema,
  createCommentSchema,
  editCommentSchema,
  deleteCommentSchema,
  updateCommentStatusSchema,
};
