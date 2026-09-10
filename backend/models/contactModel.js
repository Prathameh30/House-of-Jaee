// models/contactModel.js
const { pool } = require('../config/db');

const ContactModel = {
  async create({ name, email, phone, subject, message }) {
    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject || null, message]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return rows;
  },

  async markRead(id) {
    await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE message_id = ?', [id]);
  },
};

const NewsletterModel = {
  async subscribe(email) {
    const [result] = await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email',
      [email]
    );
    return result.insertId;
  },
};

module.exports = { ContactModel, NewsletterModel };
