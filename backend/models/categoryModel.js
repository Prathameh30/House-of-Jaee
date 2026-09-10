// models/categoryModel.js
const { pool } = require('../config/db');

const CategoryModel = {
  async findAll({ activeOnly = true } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC'
      : 'SELECT * FROM categories ORDER BY name ASC';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  },

  async create({ name, slug, description, imageUrl }) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [name, slug, description || null, imageUrl || null]
    );
    return result.insertId;
  },

  async update(id, { name, slug, description, imageUrl, isActive }) {
    await pool.query(
      `UPDATE categories
       SET name = ?, slug = ?, description = ?, image_url = ?, is_active = ?
       WHERE category_id = ?`,
      [name, slug, description || null, imageUrl || null, isActive, id]
    );
  },

  async remove(id) {
    await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
  },

  async countProducts(id) {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE category_id = ?', [id]);
    return rows[0].count;
  },
};

module.exports = CategoryModel;
