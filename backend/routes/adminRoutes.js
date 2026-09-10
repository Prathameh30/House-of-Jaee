// routes/adminRoutes.js
// All routes here are mounted under /api/admin and protected by requireAdmin in server.js's router-level middleware.
const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const contactController = require('../controllers/contactController');

// ---- Dashboard ----
router.get('/dashboard/stats', orderController.getDashboardStats);

// ---- Products ----
router.get('/products/:id', productController.getProductByIdAdmin);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.post('/products/:id/images', productController.addProductImage);
router.delete('/products/images/:imageId', productController.deleteProductImage);

// ---- Categories ----
router.get('/categories', categoryController.getAllCategoriesAdmin);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// ---- Orders ----
router.get('/orders', orderController.getAllOrdersAdmin);
router.get('/orders/:id', orderController.getOrderByIdAdmin);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// ---- Contact Messages ----
router.get('/contact-messages', contactController.getAllMessagesAdmin);
router.put('/contact-messages/:id/read', contactController.markMessageRead);

module.exports = router;
