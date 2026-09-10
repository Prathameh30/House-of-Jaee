// src/services/authService.js
import api from './api';

export const authService = {
  // Customer
  customerRegister: (data) => api.post('/customer/auth/register', data),
  customerLogin: (data) => api.post('/customer/auth/login', data),
  customerProfile: () => api.get('/customer/auth/me'),

  // Admin
  adminLogin: (data) => api.post('/admin/auth/login', data),
  adminProfile: () => api.get('/admin/auth/me'),
  adminUpdateProfile: (data) => api.put('/admin/auth/me', data),
  adminChangePassword: (data) => api.put('/admin/auth/change-password', data),
  adminForgotPassword: (email) => api.post('/admin/auth/forgot-password', { email }),
  adminResetPassword: (data) => api.post('/admin/auth/reset-password', data),
};