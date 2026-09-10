// src/pages/admin/AdminProductFormPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { FullPageSpinner } from '../../components/common/Spinner';
import Button from '../../components/common/Button';

const MAX_IMAGES = 10;

const emptyForm = {
  categoryId: '', name: '', description: '', price: '', discountPrice: '', stockQuantity: '',
  isActive: true,
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  // Images already saved to the product (edit mode) — each has image_id, image_url, public_id, is_primary
  const [images, setImages] = useState([]);
  // Files chosen but not yet uploaded to Cloudinary
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    categoryService.getAllAdmin().then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productService.getByIdAdmin(id).then((res) => {
      const p = res.data.product;
      setForm({
        categoryId: p.category_id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        discountPrice: p.discount_price || '',
        stockQuantity: p.stock_quantity,
        isActive: !!p.is_active,
      });
      setImages(p.images || []);
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const totalImageCount = images.length + pendingFiles.length;

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) return;

    const remainingSlots = MAX_IMAGES - totalImageCount;
    if (remainingSlots <= 0) {
      showToast(`You can only have up to ${MAX_IMAGES} images.`, 'error');
      return;
    }

    const withPreviews = incoming.slice(0, remainingSlots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPendingFiles((prev) => [...prev, ...withPreviews]);
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemovePendingFile = (idx) => {
    setPendingFiles((files) => {
      URL.revokeObjectURL(files[idx].preview);
      return files.filter((_, i) => i !== idx);
    });
  };

  // Keep a ref in sync with pendingFiles so the unmount cleanup below
  // always sees the latest value without re-running (and revoking
  // still-in-use preview URLs) on every change.
  const pendingFilesRef = useRef(pendingFiles);
  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  // Revoke any remaining preview URLs only when the component unmounts
  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const handleRemoveExistingImage = async (img, idx) => {
    if (isEdit && img.image_id) {
      try {
        await productService.removeImage(img.image_id);
      } catch (err) {
        showToast(err.message, 'error');
        return;
      }
    }
    setImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stockQuantity: Number(form.stockQuantity),
    };

    try {
      if (isEdit) {
        // Upload any newly added files and attach them to the existing product
        if (pendingFiles.length > 0) {
          setUploading(true);
          try {
            const uploadRes = await productService.uploadImages(pendingFiles.map((pf) => pf.file));
            const uploaded = uploadRes.data.images; // [{ url, publicId }]

            let nextDisplayOrder = images.length
              ? Math.max(...images.map((im) => im.display_order || 0)) + 1
              : 1;

            const newImages = [];
            for (let i = 0; i < uploaded.length; i++) {
              const img = uploaded[i];
              const isPrimary = images.length === 0 && i === 0;
              const addRes = await productService.addImage(id, {
                imageUrl: img.url,
                publicId: img.publicId,
                isPrimary,
                displayOrder: nextDisplayOrder + i,
              });
              newImages.push({
                image_id: addRes.data.imageId,
                image_url: img.url,
                public_id: img.publicId,
                is_primary: isPrimary,
                display_order: nextDisplayOrder + i,
              });
            }
            setImages((imgs) => [...imgs, ...newImages]);

            pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
            setPendingFiles([]);
          } finally {
            setUploading(false);
          }
        }

        await productService.update(id, payload);
        showToast('Product updated.', 'success');
      } else {
        let uploadedImages = [];
        if (pendingFiles.length > 0) {
          setUploading(true);
          try {
            const uploadRes = await productService.uploadImages(pendingFiles.map((pf) => pf.file));
            uploadedImages = uploadRes.data.images; // [{ url, publicId }]
            pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
          } finally {
            setUploading(false);
          }
        }

        await productService.create({ ...payload, images: uploadedImages });
        showToast('Product created.', 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-maroon mb-5 hover:underline">
        <FiArrowLeft size={14} /> Back to Products
      </Link>

      <h1 className="font-display text-2xl text-brown mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-beige-dark rounded-sm p-6 flex flex-col gap-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Product Name</label>
            <input required value={form.name} onChange={handleChange('name')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Category</label>
            <select required value={form.categoryId} onChange={handleChange('categoryId')} className="input-field">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Description</label>
          <textarea rows={3} value={form.description} onChange={handleChange('description')} className="input-field resize-none" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Price (₹)</label>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={handleChange('price')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Discount Price (₹)</label>
            <input type="number" min="0" step="0.01" value={form.discountPrice} onChange={handleChange('discountPrice')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Stock Quantity</label>
            <input required type="number" min="0" value={form.stockQuantity} onChange={handleChange('stockQuantity')} className="input-field" />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Product Images</label>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-sm py-8 px-4 cursor-pointer transition-colors ${
              isDragging ? 'border-maroon bg-maroon/5' : 'border-beige-dark hover:border-maroon/50'
            }`}
          >
            <FiUploadCloud size={28} className="text-maroon" />
            <p className="text-sm text-brown font-medium">Drag & drop images here, or click to browse</p>
            <p className="text-xs text-brown/60">Maximum {MAX_IMAGES} images</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {uploading && <p className="text-xs text-maroon mt-2">Uploading images...</p>}

          {(images.length > 0 || pendingFiles.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((img, idx) => (
                <div key={img.image_id ?? `existing-${idx}`} className="relative w-20 h-24 rounded-sm overflow-hidden border border-beige-dark">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute bottom-0 inset-x-0 bg-maroon/80 text-white text-[9px] text-center py-0.5">Primary</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(img, idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    aria-label="Remove image"
                  >
                    <FiTrash2 size={10} />
                  </button>
                </div>
              ))}

              {pendingFiles.map((pf, idx) => (
                <div key={`pending-${idx}`} className="relative w-20 h-24 rounded-sm overflow-hidden border border-beige-dark">
                  <img src={pf.preview} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-brown/80 text-white text-[9px] text-center py-0.5">New</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePendingFile(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    aria-label="Remove image"
                  >
                    <FiTrash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-brown">
            <input type="checkbox" checked={form.isActive} onChange={handleChange('isActive')} className="accent-maroon" /> Active
          </label>
        </div>

        <Button type="submit" size="lg" className="mt-2 self-start" disabled={submitting || uploading}>
          {uploading ? 'Uploading...' : submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </form>
    </div>
  );
}