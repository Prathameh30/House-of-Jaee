// controllers/categoryController.js
const CategoryModel = require('../models/categoryModel');
const { asyncHandler } = require('../middleware/errorHandler');

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

// GET /api/categories  (public)
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.findAll({ activeOnly: true });
  res.json({ success: true, categories });
});

// GET /api/categories/:slug  (public)
exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findBySlug(req.params.slug);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  res.json({ success: true, category });
});

// ---- Admin-only below ----

// GET /api/admin/categories
exports.getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.findAll({ activeOnly: false });
  res.json({ success: true, categories });
});

// POST /api/admin/categories
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }
  const slug = slugify(name);
  const existing = await CategoryModel.findBySlug(slug);
  if (existing) {
    return res.status(409).json({ success: false, message: 'A category with a similar name already exists.' });
  }
  const categoryId = await CategoryModel.create({ name, slug, description, imageUrl });
  res.status(201).json({ success: true, message: 'Category created.', categoryId });
});

// PUT /api/admin/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, isActive } = req.body;

  const category = await CategoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const slug = name ? slugify(name) : category.slug;
  await CategoryModel.update(id, {
    name: name || category.name,
    slug,
    description: description !== undefined ? description : category.description,
    imageUrl: imageUrl !== undefined ? imageUrl : category.image_url,
    isActive: isActive !== undefined ? isActive : category.is_active,
  });

  res.json({ success: true, message: 'Category updated.' });
});

// DELETE /api/admin/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  const productCount = await CategoryModel.countProducts(id);
  if (productCount > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete: ${productCount} product(s) still belong to this category.`,
    });
  }
  await CategoryModel.remove(id);
  res.json({ success: true, message: 'Category deleted.' });
});
