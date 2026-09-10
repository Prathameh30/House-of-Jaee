// src/pages/OrderTrackingPage.jsx
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/format';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await orderService.track(orderNumber.trim());
      setOrder(res.data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.order_status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-14">
      <h1 className="font-display text-3xl text-maroon mb-2 text-center">Track Your Order</h1>
      <p className="text-brown-light text-center mb-8">Enter your order number to check the latest status.</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. HOJ-2026-10011234"
          className="input-field flex-1"
        />
        <Button type="submit" disabled={loading}>
          <FiSearch /> Track
        </Button>
      </form>

      {loading && <div className="flex justify-center"><Spinner size={32} /></div>}

      {error && (
        <p className="text-center text-red-700 text-sm bg-red-50 border border-red-200 rounded-sm py-3">{error}</p>
      )}

      {order && order.order_status === 'Cancelled' && (
        <div className="bg-white border border-beige-dark rounded-sm p-6 text-center">
          <span className={`inline-block text-xs px-2.5 py-1 rounded-sm font-medium ${ORDER_STATUS_COLORS.Cancelled}`}>
            Cancelled
          </span>
          <p className="text-brown-light mt-3">This order has been cancelled.</p>
        </div>
      )}

      {order && order.order_status !== 'Cancelled' && (
        <div className="bg-white border border-beige-dark rounded-sm p-6">
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-xs uppercase text-brown-light">Order Number</p>
              <p className="font-semibold text-brown">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-brown-light">Estimated Delivery</p>
              <p className="font-semibold text-brown">{formatDate(order.estimated_delivery_date)}</p>
            </div>
          </div>

          {/* Status timeline */}
          <div className="flex items-center justify-between mb-8">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && (
                  <div
                    className={`absolute h-0.5 w-full right-1/2 top-3 -z-0 ${
                      idx <= currentStepIndex ? 'bg-maroon' : 'bg-beige-dark'
                    }`}
                  />
                )}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 ${
                    idx <= currentStepIndex ? 'bg-maroon text-cream' : 'bg-beige-dark text-brown-light'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[11px] mt-2 text-center ${idx <= currentStepIndex ? 'text-brown font-medium' : 'text-brown-light'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-beige-dark pt-4">
            <h3 className="font-display text-base text-brown mb-3">Items</h3>
            {order.items.map((item) => (
              <div key={item.order_item_id} className="flex justify-between text-sm mb-2">
                <span className="text-brown-light">{item.product_name} × {item.quantity}</span>
                <span className="text-brown font-medium">{formatPrice(item.line_total)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-brown text-base border-t border-beige-dark pt-3 mt-2">
              <span>Total</span><span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
