const { pool } = require('../config/db');

async function ensureProductImageColumns() {
  const [columns] = await pool.query('DESCRIBE product_images');
  const existingColumns = new Set(columns.map((column) => column.Field));

  if (!existingColumns.has('public_id')) {
    await pool.query(
      'ALTER TABLE product_images ADD COLUMN public_id VARCHAR(255) NULL AFTER image_url',
    );
    console.log('✅ Ensured public_id column exists on product_images table.');
  }
}

module.exports = ensureProductImageColumns;
