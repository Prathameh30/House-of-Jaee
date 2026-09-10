// src/services/contactService.js
import api from './api';

export const contactService = {
  submit: (data) => api.post('/contact', data),
  subscribeNewsletter: (email) => api.post('/newsletter/subscribe', { email }),

  // Admin
  getAllMessages: () => api.get('/admin/contact-messages'),
  markRead: (id) => api.put(`/admin/contact-messages/${id}/read`),
};
