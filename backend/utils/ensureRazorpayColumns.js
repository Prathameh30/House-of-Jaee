const { pool } = require('../config/db');

async function ensureRazorpayColumns() {
  const [columns] = await pool.query('DESCRIBE payments');
  const existingColumns = new Set(columns.map((column) => column.Field));

  const additions = [];

  if (!existingColumns.has('razorpay_order_id')) {
    additions.push(
      'ADD COLUMN razorpay_order_id VARCHAR(100) NULL AFTER transaction_ref',
    );
  }

  if (!existingColumns.has('razorpay_payment_id')) {
    additions.push(
      'ADD COLUMN razorpay_payment_id VARCHAR(100) NULL AFTER razorpay_order_id',
    );
  }

  if (!existingColumns.has('razorpay_signature')) {
    additions.push(
      'ADD COLUMN razorpay_signature VARCHAR(255) NULL AFTER razorpay_payment_id',
    );
  }

  if (!existingColumns.has('payment_failure_reason')) {
    additions.push(
      'ADD COLUMN payment_failure_reason VARCHAR(255) NULL AFTER razorpay_signature',
    );
  }

  if (additions.length > 0) {
    await pool.query(`ALTER TABLE payments ${additions.join(', ')}`);
    console.log('✅ Ensured Razorpay columns exist on payments table.');
  }
}

module.exports = ensureRazorpayColumns;
