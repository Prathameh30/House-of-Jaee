// routes/adminAuthRoutes.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { requireAdmin } = require("../middleware/auth");

// Blocks brute-force login attempts — 5 tries per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Prevents spamming reset emails — 3 requests per 15 minutes per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many reset requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", adminAuthController.login);
router.get("/me", requireAdmin, adminAuthController.getProfile);
router.put("/me", requireAdmin, adminAuthController.updateProfile);
router.put(
  "/change-password",
  requireAdmin,
  adminAuthController.changePassword,
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  adminAuthController.forgotPassword,
);
router.post("/reset-password", adminAuthController.resetPassword);

module.exports = router;
