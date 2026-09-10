// src/pages/OrderConfirmationPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiCopy, FiPackage } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import { FullPageSpinner } from '../components/common/Spinner';
import Button from '../components/common/Button';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService
      .track(orderNumber)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError('We could not find this order.'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderNumber);
    showToast('Order ID copied to clipboard!', 'success');
  };

  if (loading) return <FullPageSpinner />;

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-brown mb-2">Order not found</h1>
        <p className="text-brown-light mb-6">{error || 'Something went wrong.'}</p>
        <Link to="/shop"><Button size="lg">Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-14">
      {/* Success header */}
      <div className="text-center mb-8">
        <FiCheckCircle size={56} className="text-green-600 mx-auto mb-4" />
        <h1 className="font-display text-3xl text-maroon mb-2">Order Placed Successfully!</h1>
        <p className="text-brown-light">
          Thank you, {order.customer_name}. We've received your order and will start preparing it shortly.
        </p>
      </div>

      {/* Order ID card */}
      <div className="bg-maroon/5 border-2 border-dashed border-maroon rounded-sm p-6 text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-brown-light mb-2">Your Order ID</p>
        <p className="font-display text-3xl md:text-4xl text-maroon font-bold tracking-wide mb-3">
          {order.order_number}
        </p>
        <button
          onClick={copyOrderId}
          className="inline-flex items-center gap-2 text-sm text-maroon border border-maroon px-4 py-2 rounded-sm hover:bg-maroon hover:text-cream transition-colors"
        >
          <FiCopy size={14} /> Copy Order ID
        </button>
        <p className="text-xs text-brown-light mt-4">
          Please save this Order ID — you'll need it to track your order status.
          {order.email && ' We\'ve also emailed a copy of this confirmation to you.'}
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-white border border-beige-dark rounded-sm p-6 mb-6">
        <h2 className="font-display text-xl text-brown mb-4">Order Summary</h2>
        <div className="flex flex-col gap-3 mb-4">
          {order.items.map((item) => (
            <div key={item.order_item_id} className="flex justify-between text-sm">
              <span className="text-brown-light">{item.product_name} × {item.quantity}</span>
              <span className="text-brown font-medium">{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm border-t border-beige-dark pt-4">
          <div className="flex justify-between text-brown-light">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-brown-light">
            <span>Delivery</span>
            <span>{Number(order.delivery_charge) === 0 ? 'FREE' : formatPrice(order.delivery_charge)}</span>
          </div>
          <div className="flex justify-between font-semibold text-brown text-base border-t border-beige-dark pt-3">
            <span>Total</span><span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Delivery details */}
      <div className="bg-white border border-beige-dark rounded-sm p-6 mb-8">
        <h2 className="font-display text-xl text-brown mb-4 flex items-center gap-2">
          <FiPackage size={20} className="text-maroon" /> Delivery Details
        </h2>
        <p className="text-sm text-brown-light leading-relaxed">
          {order.address_line}, {order.city}, {order.state} - {order.pin_code}
        </p>
        <p className="text-sm text-brown-light mt-2">Mobile: {order.mobile_number}</p>
        <p className="text-sm text-brown-light mt-2">
          Estimated Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/order-tracking" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">Track This Order</Button>
        </Link>
        <Link to="/shop" className="flex-1">
          <Button size="lg" className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}