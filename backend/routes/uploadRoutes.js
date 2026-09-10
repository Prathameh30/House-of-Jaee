// backend/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { uploadImages } = require('../controllers/uploadController');
const { requireAdmin } = require('../middleware/auth');

router.post(
  '/',
  requireAdmin,
  upload.array('images', 10),
  uploadImages
);

module.exports = router;