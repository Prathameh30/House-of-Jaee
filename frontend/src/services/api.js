// src/services/api.js

import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the correct token depending on the request.
// Admin routes include both /admin and /upload.
api.interceptors.request.use((config) => {
  const url = config.url || '';

  const isAdminRoute =
    url.startsWith('/admin') ||
    url.startsWith('/upload');

  const token = isAdminRoute
    ? localStorage.getItem('hoj_admin_token')
    : localStorage.getItem('hoj_customer_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default api;