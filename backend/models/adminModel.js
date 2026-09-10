// models/adminModel.js
const { pool } = require('../config/db');

const AdminModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT admin_id, name, email, role, created_at FROM admins WHERE admin_id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  // Includes password hash — used internally for password verification, never sent to frontend
  async findByIdWithPassword(id) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE admin_id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ name, email, hashedPassword, role = 'ADMIN' }) {
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  },

  async updateProfile(id, { name, email }) {
    await pool.query(
      'UPDATE admins SET name = ?, email = ? WHERE admin_id = ?',
      [name, email, id]
    );
  },

  async updatePassword(id, hashedPassword) {
    await pool.query('UPDATE admins SET password = ? WHERE admin_id = ?', [hashedPassword, id]);
  },

  // ===========================
  // Password Reset
  // ===========================
  async setResetToken(adminId, tokenHash, expiresAt) {
    await pool.query(
      'UPDATE admins SET reset_token_hash = ?, reset_token_expires = ? WHERE admin_id = ?',
      [tokenHash, expiresAt, adminId]
    );
  },

  async findByResetTokenHash(tokenHash) {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE reset_token_hash = ? AND reset_token_expires > NOW() LIMIT 1',
      [tokenHash]
    );
    return rows[0] || null;
  },

  async updatePasswordAndClearToken(adminId, hashedPassword) {
    await pool.query(
      'UPDATE admins SET password = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE admin_id = ?',
      [hashedPassword, adminId]
    );
  },
};

module.exports = AdminModel;