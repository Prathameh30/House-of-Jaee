// src/pages/admin/AdminProductsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';
import { FullPageSpinner } from '../../components/common/Spinner';
import Button from '../../components/common/Button';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProducts = () => {
    setLoading(true);
    productService.getAll({ limit: 100 }).then((res) => setProducts(res.data.products)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productService.remove(product.product_id);
      showToast('Product deleted.', 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-brown">Products</h1>
        <Link to="/admin/products/new">
          <Button><FiPlus /> Add Product</Button>
        </Link>
      </div>

      <div className="bg-white border border-beige-dark rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brown-light border-b border-beige-dark">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id} className="border-b border-beige-dark/60 last:border-0">
                <td className="px-5 py-3 font-medium text-brown max-w-xs truncate">{p.name}</td>
                <td className="px-5 py-3 text-brown-light">{p.category_name}</td>
                <td className="px-5 py-3 text-brown">
                  {formatPrice(p.discount_price || p.price)}
                  {p.discount_price && <span className="text-xs text-brown-light line-through ml-1">{formatPrice(p.price)}</span>}
                </td>
                <td className="px-5 py-3 text-brown-light">{p.stock_quantity}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-sm font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/admin/products/${p.product_id}/edit`} className="text-maroon hover:text-maroon-dark mr-3 inline-block" aria-label="Edit">
                    <FiEdit2 size={15} />
                  </Link>
                  <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800" aria-label="Delete">
                    <FiTrash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
