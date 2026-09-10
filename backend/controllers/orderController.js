// controllers/orderController.js
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { pool } = require("../config/db");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const generateOrderNumber = require("../utils/generateOrderNumber");
const sendOrderConfirmationEmail = require("../utils/sendOrderConfirmationEmail");
const { asyncHandler } = require("../middleware/errorHandler");

const DELIVERY_CHARGE = 99.0;
const FREE_DELIVERY_THRESHOLD = 7000.0;
const VALID_PAYMENT_METHODS = ["UPI", "Credit Card"];
const RAZORPAY_PAYMENT_METHODS = ["UPI", "Credit Card"];

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getOrderSummary = async ({
  customerName,
  mobileNumber,
  email,
  addressLine,
  city,
  state,
  pinCode,
  items,
}) => {
  if (
    !customerName ||
    !mobileNumber ||
    !email ||
    !addressLine ||
    !city ||
    !state ||
    !pinCode
  ) {
    throw new Error("All delivery details are required.");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  let subtotal = 0;
  const resolvedItems = [];

  for (const item of items) {
    const product = await ProductModel.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found.`);
    }
    if (!product.is_active) {
      throw new Error(`${product.name} is no longer available.`);
    }
    if (product.stock_quantity < item.quantity) {
      throw new Error(
        `Only ${product.stock_quantity} unit(s) of ${product.name} left in stock.`,
      );
    }

    const unitPrice = Number(product.discount_price ?? product.price);
    resolvedItems.push({
      productId: product.product_id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice,
    });
    subtotal += unitPrice * item.quantity;
  }

  const deliveryCharge =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const totalAmount = subtotal + deliveryCharge;

  return {
    subtotal,
    deliveryCharge,
    totalAmount,
    estimatedDeliveryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: resolvedItems,
  };
};

const verifyRazorpaySignature = ({
  order_id,
  payment_id,
  razorpay_signature,
}) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || !order_id || !payment_id || !razorpay_signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  return generatedSignature === razorpay_signature;
};

// POST /api/orders/checkout  (works for guests AND logged-in customers — optionalCustomerAuth)
exports.checkout = asyncHandler(async (req, res) => {
  const {
    customerName,
    mobileNumber,
    email,
    addressLine,
    city,
    state,
    pinCode,
    items,
    paymentMethod,
  } = req.body;

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid payment method." });
  }

  try {
    const summary = await getOrderSummary({
      customerName,
      mobileNumber,
      email,
      addressLine,
      city,
      state,
      pinCode,
      items,
    });

    const orderNumber = generateOrderNumber();
    const customerId = req.customer ? req.customer.id : null;
    const orderId = await OrderModel.createOrderWithItems({
      orderNumber,
      customerId,
      customerName,
      mobileNumber,
      email,
      addressLine,
      city,
      state,
      pinCode,
      subtotal: summary.subtotal,
      deliveryCharge: summary.deliveryCharge,
      totalAmount: summary.totalAmount,
      estimatedDeliveryDate: summary.estimatedDeliveryDate,
      items: summary.items,
      paymentMethod,
      paymentStatus:
        paymentMethod === "Cash on Delivery" ? "Pending" : "Success",
      transactionRef:
        paymentMethod === "Cash on Delivery"
          ? null
          : `TXN-${paymentMethod.replace(/\s+/g, "").toUpperCase()}-${Date.now()}`,
    });

    const order = await OrderModel.findById(orderId);
    sendOrderConfirmationEmail(order);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to place order.",
    });
  }
});

// POST /api/orders/create-razorpay-order
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    mobileNumber,
    email,
    addressLine,
    city,
    state,
    pinCode,
    items,
    paymentMethod,
  } = req.body;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Razorpay credentials are not configured.",
    });
  }

  if (!RAZORPAY_PAYMENT_METHODS.includes(paymentMethod || "UPI")) {
    return res.status(400).json({
      success: false,
      message:
        "Only UPI and credit/debit card payments are supported in Razorpay checkout.",
    });
  }

  try {
    const summary = await getOrderSummary({
      customerName,
      mobileNumber,
      email,
      addressLine,
      city,
      state,
      pinCode,
      items,
    });

    const amountInPaise = Math.round(summary.totalAmount * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum order amount for Razorpay is ₹1.00.",
      });
    }

    const orderNumber = generateOrderNumber();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderNumber,
      notes: {
        customerName,
        mobileNumber,
        email,
        paymentMethod: paymentMethod || "UPI",
      },
    });

    const orderId = await OrderModel.createOrderWithItems({
      orderNumber,
      customerId: req.customer ? req.customer.id : null,
      customerName,
      mobileNumber,
      email,
      addressLine,
      city,
      state,
      pinCode,
      subtotal: summary.subtotal,
      deliveryCharge: summary.deliveryCharge,
      totalAmount: summary.totalAmount,
      estimatedDeliveryDate: summary.estimatedDeliveryDate,
      items: summary.items,
      paymentMethod: paymentMethod || "UPI",
      paymentStatus: "Pending",
      transactionRef: `RZP-${razorpayOrder.id}`,
    });

    const order = await OrderModel.findById(orderId);
    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully.",
      order,
      razorpay: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        orderNumber,
      },
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: "Razorpay authentication failed.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Razorpay order.",
    });
  }
});

// POST /api/orders/verify-payment
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    orderNumber,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing Razorpay payment details.",
    });
  }

  const order = orderNumber
    ? await OrderModel.findByOrderNumber(orderNumber)
    : null;

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  const isValidSignature = verifyRazorpaySignature({
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id,
    razorpay_signature,
  });

  if (!isValidSignature) {
    await OrderModel.updatePaymentStatus({
      orderId: order.order_id,
      paymentStatus: "Failed",
      transactionRef: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentFailureReason: "Signature verification failed.",
    });
    await OrderModel.updateStatus(order.order_id, "Cancelled");

    return res.status(400).json({
      success: false,
      message: "Payment verification failed. Signature mismatch.",
    });
  }

  const [paymentRows] = await pool.query(
    "SELECT payment_status FROM payments WHERE order_id = ? LIMIT 1",
    [order.order_id],
  );

  if (paymentRows[0]?.payment_status === "Success") {
    const updatedOrder = await OrderModel.findById(order.order_id);
    return res.json({
      success: true,
      message: "Payment verified successfully.",
      order: updatedOrder,
    });
  }

  await OrderModel.updatePaymentStatus({
    orderId: order.order_id,
    paymentStatus: "Success",
    transactionRef: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    paymentFailureReason: null,
  });
  await OrderModel.updateStatus(order.order_id, "Confirmed");

  const updatedOrder = await OrderModel.findById(order.order_id);
  sendOrderConfirmationEmail(updatedOrder);

  return res.json({
    success: true,
    message: "Payment verified successfully.",
    order: updatedOrder,
  });
});

exports.markPaymentFailed = asyncHandler(async (req, res) => {
  const { orderNumber, reason, razorpay_order_id, razorpay_payment_id } =
    req.body;

  if (!orderNumber) {
    return res.status(400).json({
      success: false,
      message: "Order number is required.",
    });
  }

  const order = await OrderModel.findByOrderNumber(orderNumber);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  await OrderModel.updatePaymentStatus({
    orderId: order.order_id,
    paymentStatus: "Failed",
    transactionRef: razorpay_payment_id || null,
    razorpayOrderId: razorpay_order_id || null,
    razorpayPaymentId: razorpay_payment_id || null,
    razorpaySignature: null,
    paymentFailureReason:
      reason || "Payment failed or was cancelled by the customer.",
  });
  await OrderModel.updateStatus(order.order_id, "Cancelled");

  return res.json({
    success: false,
    message: "Payment failed and order was marked cancelled.",
    order,
  });
});

exports.completePaymentOrder = asyncHandler(async (req, res) => {
  const { orderNumber, ...payload } = req.body;
  return exports.verifyPayment(
    {
      ...req,
      body: { ...(payload || {}), orderNumber },
    },
    res,
  );
});

// GET /api/orders/track/:orderNumber  (public — anyone with the order number can track it)
exports.trackOrder = asyncHandler(async (req, res) => {
  const order = await OrderModel.findByOrderNumber(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found. Please check your order number.",
    });
  }
  res.json({ success: true, order });
});

// GET /api/orders/my-orders  (logged-in customers only)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.findByCustomerId(req.customer.id);
  res.json({ success: true, orders });
});

// ---- Admin-only below ----

// GET /api/admin/orders?status=&page=&limit=
exports.getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const { orders, total } = await OrderModel.findAll({
    status,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json({
    success: true,
    orders,
    pagination: {
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    },
  });
});

// GET /api/admin/orders/:id
exports.getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }
  res.json({ success: true, order });
});

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order status." });
  }
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }
  await OrderModel.updateStatus(req.params.id, status);
  res.json({ success: true, message: "Order status updated." });
});

// GET /api/admin/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const orderStats = await OrderModel.getStats();
  const totalProducts = await ProductModel.countAll();
  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders: orderStats.totalOrders,
      revenue: orderStats.totalRevenue,
      pendingOrders: orderStats.pendingOrders,
    },
  });
});
