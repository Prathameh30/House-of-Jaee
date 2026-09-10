// models/orderModel.js
const { pool } = require("../config/db");

const OrderModel = {
  /**
   * Creates an order + order items + payment record inside a single DB transaction.
   * `items` is an array of { productId, productName, quantity, unitPrice }.
   */
  async createOrderWithItems({
    orderNumber,
    customerId,
    customerName,
    mobileNumber,
    email,
    addressLine,
    city,
    state,
    pinCode,
    subtotal,
    deliveryCharge,
    totalAmount,
    estimatedDeliveryDate,
    items,
    paymentMethod,
    paymentStatus,
    transactionRef,
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders
         (order_number, customer_id, customer_name, mobile_number, email, address_line, city, state, pin_code,
          subtotal, delivery_charge, total_amount, order_status, estimated_delivery_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
        [
          orderNumber,
          customerId || null,
          customerName,
          mobileNumber,
          email || null,
          addressLine,
          city,
          state,
          pinCode,
          subtotal,
          deliveryCharge,
          totalAmount,
          estimatedDeliveryDate,
        ],
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        const lineTotal = item.unitPrice * item.quantity;
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.quantity,
            item.unitPrice,
            lineTotal,
          ],
        );
        // Reduce stock within the same transaction.
        await conn.query(
          "UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE product_id = ?",
          [item.quantity, item.productId],
        );
      }

      const finalPaymentStatus =
        paymentStatus ||
        (paymentMethod === "Cash on Delivery" ? "Pending" : "Success");
      const finalTransactionRef =
        transactionRef ||
        (paymentMethod === "Cash on Delivery"
          ? null
          : `TXN-${paymentMethod.replace(/\s+/g, "").toUpperCase()}-${Date.now()}`);

      await conn.query(
        `INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_ref, paid_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          paymentMethod,
          finalPaymentStatus,
          totalAmount,
          finalTransactionRef,
          finalPaymentStatus === "Success" ? new Date() : null,
        ],
      );

      if (finalPaymentStatus === "Success") {
        await conn.query(
          "UPDATE orders SET order_status = ? WHERE order_id = ?",
          ["Confirmed", orderId],
        );
      }

      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findByOrderNumber(orderNumber) {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE order_number = ? LIMIT 1",
      [orderNumber],
    );
    if (!rows[0]) return null;
    return this._attachItemsAndPayment(rows[0]);
  },

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE order_id = ? LIMIT 1",
      [id],
    );
    if (!rows[0]) return null;
    return this._attachItemsAndPayment(rows[0]);
  },

  async _attachItemsAndPayment(order) {
    const [items] = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order.order_id],
    );
    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE order_id = ?",
      [order.order_id],
    );
    return { ...order, items, payment: payments[0] || null };
  },

  async findByCustomerId(customerId) {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
      [customerId],
    );
    return Promise.all(rows.map((o) => this._attachItemsAndPayment(o)));
  },

  async findAll({ status, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("order_status = ?");
      params.push(status);
    }
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const offset = (Math.max(1, page) - 1) * limit;

    const [rows] = await pool.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)],
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders ${whereClause}`,
      params,
    );

    return { orders: rows, total: countRows[0].total };
  },

  async updateStatus(orderId, status) {
    await pool.query("UPDATE orders SET order_status = ? WHERE order_id = ?", [
      status,
      orderId,
    ]);
  },

  async updatePaymentStatus({
    orderId,
    paymentStatus,
    transactionRef = null,
    razorpayOrderId = null,
    razorpayPaymentId = null,
    razorpaySignature = null,
    paymentFailureReason = null,
  }) {
    await pool.query(
      `UPDATE payments
       SET payment_status = ?,
           transaction_ref = COALESCE(?, transaction_ref),
           razorpay_order_id = COALESCE(?, razorpay_order_id),
           razorpay_payment_id = COALESCE(?, razorpay_payment_id),
           razorpay_signature = COALESCE(?, razorpay_signature),
           payment_failure_reason = ?,
           paid_at = CASE WHEN ? = 'Success' THEN NOW() ELSE paid_at END
       WHERE order_id = ?`,
      [
        paymentStatus,
        transactionRef,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentFailureReason,
        paymentStatus,
        orderId,
      ],
    );
  },

  async getStats() {
    const [[{ totalOrders }]] = await pool.query(
      "SELECT COUNT(*) AS totalOrders FROM orders",
    );
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE order_status != 'Cancelled'",
    );
    const [[{ pendingOrders }]] = await pool.query(
      "SELECT COUNT(*) AS pendingOrders FROM orders WHERE order_status = 'Pending'",
    );
    return { totalOrders, totalRevenue, pendingOrders };
  },
};

module.exports = OrderModel;
