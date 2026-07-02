'use strict';

const Project    = require('../models/Project');
const catchAsync = require('../utils/catchAsync');
const AppError   = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

exports.getAllProjects = catchAsync(async (req, res, _next) => {
  const filter = {};
  if (req.user?.role !== 'admin') filter.status = 'active';
  if (req.query.featured) filter.featured = req.query.featured === 'true';
  if (req.query.category) filter.category = req.query.category;

  const projects = await Project.find(filter).sort('order -createdAt').lean();
  sendSuccess(res, { data: { projects } });
});

exports.getProjectById = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError('Project not found.', 404));
  sendSuccess(res, { data: { project } });
});

exports.createProject = catchAsync(async (req, res, _next) => {
  const project = await Project.create(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Project created.', data: { project } });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) return next(new AppError('Project not found.', 404));
  sendSuccess(res, { message: 'Project updated.', data: { project } });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return next(new AppError('Project not found.', 404));
  sendSuccess(res, { statusCode: 204, message: 'Project deleted.' });
});

exports.reorderProjects = catchAsync(async (req, res, next) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return next(new AppError('orderedIds must be an array.', 400));
  }

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
  }));

  await Project.bulkWrite(bulkOps);
  sendSuccess(res, { message: 'Projects reordered.' });
});
