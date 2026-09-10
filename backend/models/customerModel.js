// models/customerModel.js
const { pool } = require('../config/db');

const CustomerModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT customer_id, name, email, mobile_number, created_at FROM customers WHERE customer_id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, hashedPassword, mobileNumber }) {
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, password, mobile_number) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, mobileNumber || null]
    );
    return result.insertId;
  },
};

module.exports = CustomerModel;
