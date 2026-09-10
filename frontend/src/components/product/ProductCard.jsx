// src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice, calculateDiscountPercent } from '../../utils/format';
import PlaceholderImage from '../common/PlaceholderImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const discountPercent = calculateDiscountPercent(product.price, product.discount_price);
  const displayPrice = product.discount_price || product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock_quantity <= 0) {
      showToast('This saree is currently out of stock.', 'error');
      return;
    }
    addToCart(product, 1);
    showToast(`${product.name} added to cart.`, 'success');
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white border border-beige-dark/60 rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-beige">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <PlaceholderImage seed={product.slug} className="w-full h-full" label={product.name} />
        )}

        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-maroon text-cream text-xs px-2 py-1 rounded-sm font-medium">
            {discountPercent}% OFF
          </span>
        )}
        {product.stock_quantity <= 0 && (
          <span className="absolute top-3 right-3 bg-brown text-cream text-xs px-2 py-1 rounded-sm font-medium">
            Out of Stock
          </span>
        )}

        <button
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-0 left-0 right-0 bg-maroon text-cream py-2.5 text-xs uppercase tracking-wide
            flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <FiShoppingBag size={14} /> Add to Cart
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-gold mb-1">{product.category_name}</p>
        <h3 className="font-display text-base text-brown line-clamp-2 mb-1 group-hover:text-maroon transition-colors">
          {product.name}
        </h3>

        {Number(product.rating) > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <FiStar size={12} className="text-gold fill-gold" />
            <span className="text-xs text-brown-light">{Number(product.rating).toFixed(1)} ({product.rating_count})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-semibold text-maroon">{formatPrice(displayPrice)}</span>
          {product.discount_price && (
            <span className="text-sm text-brown-light line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
