const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const AdminModel = require("../models/adminModel");
const { signToken } = require("../utils/jwt");
const sendAdminResetEmail = require("../utils/sendAdminResetEmail");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/admin/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  // Debug: check what is reaching the backend
  console.log("ADMIN LOGIN START:", {
    email: email.toLowerCase().trim(),
    hasPassword: !!password,
  });

  const admin = await AdminModel.findByEmail(email.toLowerCase().trim());

  // Debug: check whether the admin exists in Render's database
  console.log("ADMIN FOUND:", !!admin);

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  // Compare the entered password with the bcrypt hash
  const isMatch = await bcrypt.compare(password, admin.password);

  // Debug: check password result
  console.log("PASSWORD MATCH:", isMatch);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const token = signToken({
    id: admin.admin_id,
    email: admin.email,
    role: "ADMIN",
  });

  res.json({
    success: true,
    message: "Login successful.",
    token,
    admin: {
      id: admin.admin_id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

// GET /api/admin/auth/me
exports.getProfile = asyncHandler(async (req, res) => {
  const admin = await AdminModel.findById(req.admin.id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found.",
    });
  }

  res.json({
    success: true,
    admin,
  });
});

// PUT /api/admin/auth/me — update own name/email
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // If changing email, make sure it's not already taken
  const existing = await AdminModel.findByEmail(normalizedEmail);

  if (existing && existing.admin_id !== req.admin.id) {
    return res.status(400).json({
      success: false,
      message: "That email is already in use.",
    });
  }

  await AdminModel.updateProfile(req.admin.id, {
    name: name.trim(),
    email: normalizedEmail,
  });

  const updated = await AdminModel.findById(req.admin.id);

  res.json({
    success: true,
    message: "Profile updated.",
    admin: updated,
  });
});

// PUT /api/admin/auth/change-password — requires current password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current and new password are required.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters.",
    });
  }

  const admin = await AdminModel.findByIdWithPassword(req.admin.id);

  const isMatch = await bcrypt.compare(currentPassword, admin.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await AdminModel.updatePassword(req.admin.id, hashedPassword);

  res.json({
    success: true,
    message: "Password changed successfully.",
  });
});

// POST /api/admin/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const genericResponse = {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  const admin = await AdminModel.findByEmail(email.toLowerCase().trim());

  if (!admin) {
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await AdminModel.setResetToken(admin.admin_id, tokenHash, expiresAt);

  const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password?token=${rawToken}`;

  try {
    await sendAdminResetEmail(admin, resetUrl);
  } catch (err) {
    console.error("Failed to send admin reset email:", err.message);
  }

  res.json(genericResponse);
});

// POST /api/admin/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await AdminModel.findByResetTokenHash(tokenHash);

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "This reset link is invalid or has expired.",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await AdminModel.updatePasswordAndClearToken(admin.admin_id, hashedPassword);

  res.json({
    success: true,
    message: "Password reset successfully. You can now sign in.",
  });
});
