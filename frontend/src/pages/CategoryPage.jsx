// src/pages/CategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductGrid from '../components/product/ProductGrid';
import { FullPageSpinner } from '../components/common/Spinner';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryService.getBySlug(slug),
          productService.getAll({ category: slug, limit: 24 }),
        ]);
        setCategory(catRes.data.category);
        setProducts(prodRes.data.products);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <FullPageSpinner />;

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-maroon mb-2">Category not found</h1>
        <p className="text-brown-light">This category may have been removed or renamed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl md:text-4xl text-maroon">{category.name}</h1>
        {category.description && (
          <p className="text-brown-light mt-3 max-w-2xl mx-auto">{category.description}</p>
        )}
      </div>
      <ProductGrid products={products} loading={false} emptyMessage="No sarees available in this category yet." />
    </div>
  );
}
