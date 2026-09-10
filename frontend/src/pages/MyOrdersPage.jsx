// src/pages/MyOrdersPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/format';
import { FullPageSpinner } from '../components/common/Spinner';
import Button from '../components/common/Button';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.myOrders().then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl text-maroon mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage size={44} className="mx-auto text-beige-dark mb-4" />
          <p className="text-brown-light mb-6">You haven't placed any orders yet.</p>
          <Link to="/shop"><Button>Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white border border-beige-dark rounded-sm p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase text-brown-light">Order Number</p>
                  <p className="font-semibold text-brown">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-brown-light">Placed On</p>
                  <p className="text-sm text-brown">{formatDate(order.created_at)}</p>
                </div>
                <span className={`h-fit text-xs px-2.5 py-1 rounded-sm font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                  {order.order_status}
                </span>
              </div>
              <div className="text-sm text-brown-light mb-2">
                {order.items.map((i) => i.product_name).join(', ')}
              </div>
              <p className="font-semibold text-maroon">{formatPrice(order.total_amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
