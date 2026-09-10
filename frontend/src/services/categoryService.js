// src/services/categoryService.js
import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),

  // Admin
  getAllAdmin: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  remove: (id) => api.delete(`/admin/categories/${id}`),
};
