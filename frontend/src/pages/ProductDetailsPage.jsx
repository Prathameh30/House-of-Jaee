// src/pages/ProductDetailsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiMinus, FiPlus, FiShoppingBag, FiZap, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, calculateDiscountPercent } from '../utils/format';
import { FullPageSpinner } from '../components/common/Spinner';
import PlaceholderImage from '../components/common/PlaceholderImage';
import Button from '../components/common/Button';
import ZariDivider from '../components/common/ZariDivider';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveImageIdx(0);
    setQuantity(1);
    productService.getBySlug(slug)
      .then((res) => setProduct(res.data.product))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <FullPageSpinner />;

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-maroon mb-2">Saree not found</h1>
        <p className="text-brown-light">This product may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const discountPercent = calculateDiscountPercent(product.price, product.discount_price);
  const displayPrice = product.discount_price || product.price;
  const inStock = product.stock_quantity > 0;
  const images = product.images && product.images.length > 0 ? product.images : [];

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    showToast(`${product.name} added to cart.`, 'success');
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div>
          <div className="aspect-[4/5] bg-beige rounded-sm overflow-hidden mb-3">
            {images[activeImageIdx] ? (
              <img
                src={images[activeImageIdx].image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <PlaceholderImage seed={product.slug} className="w-full h-full" label={product.name} />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.image_id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-20 rounded-sm overflow-hidden border-2 ${
                    activeImageIdx === idx ? 'border-maroon' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gold mb-2">{product.category_name}</p>
          <h1 className="font-display text-3xl md:text-4xl text-brown mb-3">{product.name}</h1>

          {Number(product.rating) > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={15}
                    className={i < Math.round(product.rating) ? 'text-gold fill-gold' : 'text-beige-dark'}
                  />
                ))}
              </div>
              <span className="text-sm text-brown-light">{Number(product.rating).toFixed(1)} ({product.rating_count} reviews)</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl font-semibold text-maroon">{formatPrice(displayPrice)}</span>
            {product.discount_price && (
              <>
                <span className="text-lg text-brown-light line-through">{formatPrice(product.price)}</span>
                <span className="text-sm bg-maroon/10 text-maroon px-2 py-0.5 rounded-sm font-medium">{discountPercent}% OFF</span>
              </>
            )}
          </div>

          <p className="text-brown-light leading-relaxed mb-6">{product.description}</p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-y-3 text-sm mb-6 border-y border-beige-dark py-5">
            <Spec label="Fabric" value={product.fabric} />
            <Spec label="Colour" value={product.colour} />
            <Spec label="Occasion" value={product.occasion} />
            <Spec label="Care" value={product.care_instructions} />
          </div>

          <p className={`text-sm font-medium mb-5 ${inStock ? 'text-green-700' : 'text-red-700'}`}>
            {inStock ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-brown font-medium">Quantity</span>
            <div className="flex items-center border border-beige-dark rounded-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-brown hover:bg-beige"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} />
              </button>
              <span className="px-4 text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                className="px-3 py-2 text-brown hover:bg-beige"
                aria-label="Increase quantity"
                disabled={quantity >= product.stock_quantity}
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Button onClick={handleAddToCart} disabled={!inStock} variant="outline" size="lg" className="flex-1">
              <FiShoppingBag /> Add to Cart
            </Button>
            <Button onClick={handleBuyNow} disabled={!inStock} size="lg" className="flex-1">
              <FiZap /> Buy Now
            </Button>
          </div>

          <ZariDivider className="mb-6" />

          <div className="flex flex-col gap-3 text-sm text-brown-light">
            <div className="flex items-center gap-2"><FiTruck size={16} className="text-gold" /> Free delivery on orders above ₹7,000</div>
            <div className="flex items-center gap-2"><FiRefreshCw size={16} className="text-gold" /> Easy 7-day exchange on manufacturing defects</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-brown-light">{label}</p>
      <p className="text-brown font-medium">{value}</p>
    </div>
  );
}
