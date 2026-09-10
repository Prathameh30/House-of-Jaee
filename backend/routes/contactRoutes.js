// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/contact', contactController.submitContactForm);
router.post('/newsletter/subscribe', contactController.subscribeNewsletter);

module.exports = router;
