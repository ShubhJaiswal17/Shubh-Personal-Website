'use strict';

const express = require('express');
const router  = express.Router();

const projectController = require('../controllers/project.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema } = require('../validators/schemas');

// Public
router.get('/',     projectController.getAllProjects);
router.get('/:id',  projectController.getProjectById);

// Admin only
router.use(protect, restrictTo('admin'));
router.post('/',          validate(createProjectSchema), projectController.createProject);
router.put('/:id',        validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id',                                    projectController.deleteProject);
router.patch('/reorder',                                 projectController.reorderProjects);

module.exports = router;
