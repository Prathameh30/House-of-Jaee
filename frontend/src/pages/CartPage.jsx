// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Button from '../components/common/Button';
import PlaceholderImage from '../components/common/PlaceholderImage';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, deliveryCharge, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <FiShoppingBag size={48} className="mx-auto text-beige-dark mb-4" />
        <h1 className="font-display text-2xl text-brown mb-2">Your cart is empty</h1>
        <p className="text-brown-light mb-6">Looks like you haven't added any sarees yet.</p>
        <Link to="/shop"><Button size="lg">Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <h1 className="font-display text-3xl text-maroon mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        {/* Items */}
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 bg-white border border-beige-dark rounded-sm p-4">
              <Link to={`/product/${item.slug}`} className="w-24 h-28 shrink-0 rounded-sm overflow-hidden bg-beige">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <PlaceholderImage seed={item.slug} className="w-full h-full" />
                )}
              </Link>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <Link to={`/product/${item.slug}`} className="font-display text-brown hover:text-maroon">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="Remove item"
                    className="text-brown-light hover:text-red-700 shrink-0"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <p className="text-sm font-semibold text-maroon mt-1">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center border border-beige-dark rounded-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-beige"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-beige"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stockQuantity}
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <p className="text-sm text-brown-light">
                    Subtotal: <span className="font-medium text-brown">{formatPrice(item.price * item.quantity)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="bg-white border border-beige-dark rounded-sm p-6 h-fit sticky top-24">
          <h2 className="font-display text-xl text-brown mb-5">Order Summary</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-brown-light">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brown-light">
              <span>Delivery Charges</span>
              <span>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
            </div>
            <div className="border-t border-beige-dark pt-3 flex justify-between font-semibold text-brown text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button onClick={() => navigate('/checkout')} size="lg" className="w-full mt-6">
            Proceed to Checkout <FiArrowRight />
          </Button>

          <Link to="/shop" className="block text-center text-sm text-maroon mt-4 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
