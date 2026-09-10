// controllers/productController.js
const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const { asyncHandler } = require('../middleware/errorHandler');
const cloudinary = require('../config/cloudinary'); // adjust path if your Cloudinary config lives elsewhere

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

// GET /api/products  (public — supports ?category=&search=&minPrice=&maxPrice=&inStock=&sortBy=&sortOrder=&page=&limit=)
exports.getAllProducts = asyncHandler(async (req, res) => {
  const {
    category, search,
    minPrice, maxPrice, inStock, sortBy, sortOrder, page, limit,
  } = req.query;

  const { products, total } = await ProductModel.findAll({
    categorySlug: category,
    search,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: inStock === 'true',
    sortBy,
    sortOrder,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12,
  });

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      totalPages: Math.ceil(total / (limit ? Number(limit) : 12)),
    },
  });
});

// GET /api/products/:slug  (public)
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await ProductModel.findBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  res.json({ success: true, product });
});

// ---- Admin-only below ----

// GET /api/admin/products/:id
exports.getProductByIdAdmin = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  res.json({ success: true, product });
});

// POST /api/admin/products
exports.createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.name || !data.categoryId || !data.price) {
    return res.status(400).json({ success: false, message: 'Name, categoryId, and price are required.' });
  }

  const category = await CategoryModel.findById(data.categoryId);
  if (!category) {
    return res.status(400).json({ success: false, message: 'Invalid categoryId.' });
  }

  const slug = `${slugify(data.name)}-${Date.now().toString().slice(-5)}`;
  const productId = await ProductModel.create({ ...data, slug });

  // Images now arrive as [{ url, publicId }, ...] from Cloudinary uploads
  if (Array.isArray(data.images) && data.images.length > 0) {
    for (let i = 0; i < data.images.length; i++) {
      const image = data.images[i];
      if (image.url && image.publicId) {
        await ProductModel.addImage(productId, image.url, image.publicId, i === 0, i + 1);
      }
    }
  }

  res.status(201).json({ success: true, message: 'Product created.', productId });
});

// PUT /api/admin/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await ProductModel.findById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const data = req.body;
  const slug = data.name ? `${slugify(data.name)}-${id}` : existing.slug;

  await ProductModel.update(id, {
    categoryId: data.categoryId ?? existing.category_id,
    name: data.name ?? existing.name,
    slug,
    description: data.description ?? existing.description,
    price: data.price ?? existing.price,
    discountPrice: data.discountPrice ?? existing.discount_price,
    stockQuantity: data.stockQuantity ?? existing.stock_quantity,
    isActive: data.isActive ?? existing.is_active,
  });

  res.json({ success: true, message: 'Product updated.' });
});

// DELETE /api/admin/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await ProductModel.findById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Clean up Cloudinary images before removing the product/DB rows
  if (Array.isArray(existing.images) && existing.images.length > 0) {
    for (const image of existing.images) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (err) {
          console.error(`Failed to delete Cloudinary image ${image.public_id}`, err.message);
        }
      }
    }
  }

  await ProductModel.remove(id);
  res.json({ success: true, message: 'Product deleted.' });
});

// POST /api/admin/products/:id/images
exports.addProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageUrl, publicId, isPrimary, displayOrder } = req.body;
  if (!imageUrl || !publicId) {
    return res.status(400).json({ success: false, message: 'imageUrl and publicId are required.' });
  }
  const imageId = await ProductModel.addImage(id, imageUrl, publicId, !!isPrimary, displayOrder || 0);
  res.status(201).json({ success: true, message: 'Image added.', imageId });
});

// DELETE /api/admin/products/images/:imageId
exports.deleteProductImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;

  const image = await ProductModel.getImage(imageId);
  if (!image) {
    return res.status(404).json({ success: false, message: 'Image not found.' });
  }

  if (image.public_id) {
    try {
      await cloudinary.uploader.destroy(image.public_id);
    } catch (err) {
      console.error(`Failed to delete Cloudinary image ${image.public_id}`, err.message);
    }
  }

  await ProductModel.removeImage(imageId);
  res.json({ success: true, message: 'Image removed.' });
});