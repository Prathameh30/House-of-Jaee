// routes/customerAuthRoutes.js
const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { requireCustomer } = require('../middleware/auth');

router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);
router.get('/me', requireCustomer, customerAuthController.getProfile);

module.exports = router;
