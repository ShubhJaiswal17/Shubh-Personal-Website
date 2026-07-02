/**
 * blogService.js — All API call definitions
 *
 * Pattern: thin wrappers around the `api` Axios instance.
 * Controllers live in components; services only know about endpoints.
 *
 * Each exported object groups calls by domain so imports stay clean:
 *
 *   import { blogService, projectService } from '@/services/blogService';
 */

import api from './api';

// ── Blog posts ─────────────────────────────────────────────────────────────────
export const blogService = {
  /** GET /blog — paginated list with optional filters */
  getAll: (params) => api.get('/blog', { params }),

  /** GET /blog/featured — posts with featured: true */
  getFeatured: () => api.get('/blog/featured'),

  /** GET /blog/search?q= */
  search: (q, params = {}) => api.get('/blog/search', { params: { q, ...params } }),

  /** GET /blog/tags — all unique tags with counts */
  getTags: () => api.get('/blog/tags'),

  /** GET /blog/:slug — single post by URL slug */
  getBySlug: (slug) => api.get(`/blog/${slug}`),

  /** GET /blog/:id/related */
  getRelated: (id) => api.get(`/blog/${id}/related`),

  /** PATCH /blog/:id/view — increment view counter (fire-and-forget) */
  view: (id) => api.patch(`/blog/${id}/view`),

  /** POST /blog — create (admin) */
  create: (data) => api.post('/blog', data),

  /** PUT /blog/:id — full update (admin) */
  update: (id, data) => api.put(`/blog/${id}`, data),

  /** DELETE /blog/:id — delete (admin) */
  remove: (id) => api.delete(`/blog/${id}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryService = {
  getAll:  ()          => api.get('/categories'),
  getBySlug: (slug)    => api.get(`/categories/${slug}`),
  create:  (data)      => api.post('/categories', data),
  update:  (id, data)  => api.put(`/categories/${id}`, data),
  remove:  (id)        => api.delete(`/categories/${id}`),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectService = {
  getAll:   (params)   => api.get('/projects', { params }),
  getById:  (id)       => api.get(`/projects/${id}`),
  create:   (data)     => api.post('/projects', data),
  update:   (id, data) => api.put(`/projects/${id}`, data),
  remove:   (id)       => api.delete(`/projects/${id}`),
  reorder:  (ids)      => api.patch('/projects/reorder', { orderedIds: ids }),
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactService = {
  send:    (data) => api.post('/contact', data),
  getAll:  (params) => api.get('/contact', { params }),
  markRead:(id)   => api.patch(`/contact/${id}/read`),
  remove:  (id)   => api.delete(`/contact/${id}`),
};

// ── Newsletter ────────────────────────────────────────────────────────────────
export const newsletterService = {
  subscribe:   (data)  => api.post('/newsletter/subscribe', data),
  confirm:     (token) => api.get(`/newsletter/confirm/${token}`),
  unsubscribe: (token) => api.delete(`/newsletter/unsubscribe/${token}`),
  getAll:      (params)=> api.get('/newsletter', { params }),
  getStats:    ()      => api.get('/newsletter/stats'),
};

// ── Analytics (admin) ────────────────────────────────────────────────────────
export const analyticsService = {
  overview: ()         => api.get('/analytics/overview'),
  posts:    ()         => api.get('/analytics/posts'),
  visitors: (days=30)  => api.get('/analytics/visitors', { params: { days } }),
};
