// server.js
// House of Jaee — Saree E-Commerce Backend
// Express + MySQL (mysql2) + JWT Auth (Admin + Customer)

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { testConnection } = require("./config/db");
const ensureRazorpayColumns = require("./utils/ensureRazorpayColumns");
const ensureProductImageColumns = require("./utils/ensureProductImageColumns");
const { requireAdmin } = require("./middleware/auth");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Routes
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const customerAuthRoutes = require("./routes/customerAuthRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// ---- Global Middleware ----
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} — ${req.method} ${req.originalUrl}`);
  next();
});

// ---- Health Check ----
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "House of Jaee API is running.",
    timestamp: new Date().toISOString(),
  });
});

// ---- Public Routes ----
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", contactRoutes); // /api/contact, /api/newsletter/subscribe
app.use("/api/upload", uploadRoutes);

// ---- Admin Protected Routes ----
// requireAdmin guards EVERYTHING under /api/admin (except /api/admin/auth/login handled above)
app.use("/api/admin", requireAdmin, adminRoutes);

// ---- Error Handling ----
app.use(notFound);
app.use(errorHandler);

// ---- Start Server ----
(async () => {
  await testConnection();
  await ensureRazorpayColumns();
  await ensureProductImageColumns();
  app.listen(PORT, () => {
    console.log(`🌸 House of Jaee API running on http://localhost:${PORT}`);
  });
})();
