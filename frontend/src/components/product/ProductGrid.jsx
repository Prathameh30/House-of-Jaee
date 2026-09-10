// src/components/product/ProductGrid.jsx
import ProductCard from './ProductCard';
import Spinner from '../common/Spinner';

export default function ProductGrid({ products, loading, emptyMessage = 'No sarees found.' }) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={36} />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-brown-light font-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}
