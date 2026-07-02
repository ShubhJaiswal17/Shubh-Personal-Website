/**
 * commentService.js — All comment API calls
 */
import api from './api';

export const commentService = {
  // Public
  getByPost:    (postId, params) => api.get(`/comments/${postId}`, { params }),
  create:       (postId, data)   => api.post(`/comments/${postId}`, data),
  like:         (id)             => api.patch(`/comments/${id}/like`),
  edit:         (id, data)       => api.put(`/comments/${id}`, data),
  delete:       (id, email)      => api.delete(`/comments/${id}`, { data: { email } }),

  // Admin
  adminGetAll:     (params) => api.get('/comments/admin/all', { params }),
  adminGetStats:   ()       => api.get('/comments/admin/stats'),
  adminSetStatus:  (id, status) => api.patch(`/comments/admin/${id}/status`, { status }),
  adminDelete:     (id)     => api.delete(`/comments/admin/${id}`),
};
