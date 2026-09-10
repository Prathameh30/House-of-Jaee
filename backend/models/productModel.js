const { pool } = require('../config/db');

const ProductModel = {
  // ===========================
  // Get Products
  // ===========================
  async findAll({
    categorySlug,
    search,
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    page = 1,
    limit = 12,
  } = {}) {
    const conditions = ['p.is_active = TRUE'];
    const params = [];

    if (categorySlug) {
      conditions.push('c.slug = ?');
      params.push(categorySlug);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      conditions.push('COALESCE(p.discount_price,p.price) >= ?');
      params.push(minPrice);
    }

    if (maxPrice) {
      conditions.push('COALESCE(p.discount_price,p.price) <= ?');
      params.push(maxPrice);
    }

    if (inStock) {
      conditions.push('p.stock_quantity > 0');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const allowedSort = ['price', 'created_at', 'name'];

    const safeSort = allowedSort.includes(sortBy)
      ? sortBy
      : 'created_at';

    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const [products] = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,

        (
          SELECT image_url
          FROM product_images pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.is_primary DESC, pi.display_order ASC
          LIMIT 1
        ) AS primary_image

      FROM products p

      JOIN categories c
      ON c.category_id = p.category_id

      ${whereClause}

      ORDER BY p.${safeSort} ${safeOrder}

      LIMIT ?
      OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    );

    const [count] = await pool.query(
      `
      SELECT COUNT(*) total

      FROM products p

      JOIN categories c
      ON c.category_id=p.category_id

      ${whereClause}
      `,
      params
    );

    return {
      products,
      total: count[0].total,
    };
  },

  // ===========================
  // Product by ID
  // ===========================
  async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT
      p.*,
      c.name category_name,
      c.slug category_slug

      FROM products p

      JOIN categories c
      ON c.category_id=p.category_id

      WHERE p.product_id=?

      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) return null;

    const [images] = await pool.query(
      `
      SELECT
      image_id,
      image_url,
      public_id,
      is_primary,
      display_order

      FROM product_images

      WHERE product_id=?

      ORDER BY display_order ASC
      `,
      [id]
    );

    return {
      ...rows[0],
      images,
    };
  },

  // ===========================
  // Product by Slug
  // ===========================
  async findBySlug(slug) {
    const [rows] = await pool.query(
      `
      SELECT
      p.*,
      c.name category_name,
      c.slug category_slug

      FROM products p

      JOIN categories c
      ON c.category_id=p.category_id

      WHERE p.slug=?

      LIMIT 1
      `,
      [slug]
    );

    if (!rows.length) return null;

    const [images] = await pool.query(
      `
      SELECT
      image_id,
      image_url,
      public_id,
      is_primary,
      display_order

      FROM product_images

      WHERE product_id=?

      ORDER BY display_order ASC
      `,
      [rows[0].product_id]
    );

    return {
      ...rows[0],
      images,
    };
  },

  // ===========================
  // Create Product
  // ===========================
  async create(data) {
    const [result] = await pool.query(
      `
      INSERT INTO products
      (
        category_id,
        name,
        slug,
        description,
        price,
        discount_price,
        stock_quantity,
        is_active
      )

      VALUES
      (
        ?,?,?,?,?,?,?,?
      )
      `,
      [
        data.categoryId,
        data.name,
        data.slug,
        data.description || null,
        data.price,
        data.discountPrice || null,
        data.stockQuantity || 0,
        data.isActive !== undefined
          ? !!data.isActive
          : true,
      ]
    );

    return result.insertId;
  },

  // ===========================
  // Update Product
  // ===========================
  async update(id, data) {
    await pool.query(
      `
      UPDATE products

      SET

      category_id=?,
      name=?,
      slug=?,
      description=?,
      price=?,
      discount_price=?,
      stock_quantity=?,
      is_active=?

      WHERE product_id=?
      `,
      [
        data.categoryId,
        data.name,
        data.slug,
        data.description || null,
        data.price,
        data.discountPrice || null,
        data.stockQuantity || 0,
        data.isActive !== undefined ? !!data.isActive : true,
        id,
      ]
    );
  },

  // ===========================
  // Delete Product
  // ===========================
  async remove(id) {
    await pool.query(
      'DELETE FROM products WHERE product_id=?',
      [id]
    );
  },

  // ===========================
  // Stock
  // ===========================
  async decrementStock(id, qty) {
    await pool.query(
      `
      UPDATE products

      SET stock_quantity=stock_quantity-?

      WHERE product_id=?
      `,
      [qty, id]
    );
  },

  // ===========================
  // Images
  // ===========================
  async addImage(
    productId,
    imageUrl,
    publicId,
    isPrimary = false,
    displayOrder = 0
  ) {
    const [result] = await pool.query(
      `
      INSERT INTO product_images
      (
        product_id,
        image_url,
        public_id,
        is_primary,
        display_order
      )

      VALUES
      (
        ?,?,?,?,?
      )
      `,
      [
        productId,
        imageUrl,
        publicId,
        isPrimary,
        displayOrder,
      ]
    );

    return result.insertId;
  },

  async getImage(imageId) {
    const [rows] = await pool.query(
      'SELECT * FROM product_images WHERE image_id = ?',
      [imageId]
    );

    return rows[0];
  },

  async removeImage(imageId) {
    await pool.query(
      'DELETE FROM product_images WHERE image_id=?',
      [imageId]
    );
  },

  async countAll() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) count FROM products'
    );

    return rows[0].count;
  },
};

module.exports = ProductModel;