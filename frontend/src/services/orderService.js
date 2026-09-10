// src/services/orderService.js
import api from "./api";

export const orderService = {
  checkout: (payload) => api.post("/orders/checkout", payload),
  createRazorpayOrder: (payload) =>
    api.post("/orders/create-razorpay-order", payload),
  verifyRazorpayPayment: (payload) =>
    api.post("/orders/verify-payment", payload),
  failRazorpayPayment: (payload) =>
    api.post("/orders/payment-failed", payload),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  myOrders: () => api.get("/orders/my-orders"),

  // Admin
  getAllAdmin: (params = {}) => api.get("/admin/orders", { params }),
  getByIdAdmin: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
};
