// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
