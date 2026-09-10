// src/pages/admin/AdminCategoriesPage.jsx
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { FullPageSpinner } from '../../components/common/Spinner';
import Button from '../../components/common/Button';

const emptyForm = {
  name: '',
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = () => {
    setLoading(true);
    categoryService
      .getAllAdmin()
      .then((res) => setCategories(res.data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.category_id);
    setForm({
      name: cat.name,
      isActive: !!cat.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await categoryService.update(editingId, form);
        showToast('Category updated.', 'success');
      } else {
        await categoryService.create(form);
        showToast('Category created.', 'success');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Delete category "${cat.name}"? This cannot be undone.`
      )
    )
      return;

    try {
      await categoryService.remove(cat.category_id);
      showToast('Category deleted.', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-brown">Categories</h1>

        <Button onClick={openCreateModal}>
          <FiPlus />
          Add Category
        </Button>
      </div>

      <div className="bg-white border border-beige-dark rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brown-light border-b border-beige-dark">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.category_id}
                className="border-b border-beige-dark/60 last:border-0"
              >
                <td className="px-5 py-3 font-medium text-brown">
                  {cat.name}
                </td>

                <td className="px-5 py-3 text-brown-light">
                  {cat.slug}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-sm font-medium ${
                      cat.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="text-maroon hover:text-maroon-dark mr-3"
                    aria-label="Edit"
                  >
                    <FiEdit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Delete"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-brown">
                {editingId ? 'Edit Category' : 'Add Category'}
              </h2>

              <button onClick={() => setModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1.5">
                  Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="e.g. Silk Sarees"
                />
              </div>

              {editingId && (
                <label className="flex items-center gap-2 text-sm text-brown">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isActive: e.target.checked,
                      }))
                    }
                    className="accent-maroon"
                  />
                  Active
                </label>
              )}

              <Button
                type="submit"
                className="mt-2"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                  ? 'Save Changes'
                  : 'Create Category'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}