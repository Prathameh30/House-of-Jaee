// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireCustomer, optionalCustomerAuth } = require("../middleware/auth");

// Guest or logged-in customer can checkout (Cash on Delivery and other legacy flows)
router.post("/checkout", optionalCustomerAuth, orderController.checkout);

// Razorpay integration
router.post(
  "/create-razorpay-order",
  optionalCustomerAuth,
  orderController.createRazorpayOrder,
);
router.post("/verify-payment", orderController.verifyPayment);
router.post(  '/payment-failed',
  optionalCustomerAuth,
  orderController.markPaymentFailed,
);
router.post(  "/complete-payment-order",
  optionalCustomerAuth,
  orderController.completePaymentOrder,
);

// Anyone with the order number can track it (no login needed)
router.get("/track/:orderNumber", orderController.trackOrder);

// Logged-in customers only
router.get("/my-orders", requireCustomer, orderController.getMyOrders);

module.exports = router;
