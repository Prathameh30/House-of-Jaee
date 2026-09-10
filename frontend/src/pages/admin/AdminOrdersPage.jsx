// src/pages/admin/AdminOrdersPage.jsx
import { useEffect, useState } from 'react';
import { FiEye, FiX } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/format';
import { FullPageSpinner } from '../../components/common/Spinner';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAllAdmin({ status: statusFilter || undefined, limit: 100 })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      showToast('Order status updated.', 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const viewOrder = async (orderId) => {
    try {
      const res = await orderService.getByIdAdmin(orderId);
      setSelectedOrder(res.data.order);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-brown">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-beige-dark rounded-sm px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <FullPageSpinner />
      ) : (
        <div className="bg-white border border-beige-dark rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brown-light border-b border-beige-dark">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-b border-beige-dark/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-brown">{order.order_number}</td>
                  <td className="px-5 py-3 text-brown-light">{order.customer_name}</td>
                  <td className="px-5 py-3 text-brown-light">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3 text-brown">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-sm font-medium border-0 ${ORDER_STATUS_COLORS[order.order_status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => viewOrder(order.order_id)} className="text-maroon hover:text-maroon-dark" aria-label="View order">
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-brown">{selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)}><FiX size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
              <div>
                <p className="text-xs uppercase text-brown-light">Customer</p>
                <p className="text-brown font-medium">{selectedOrder.customer_name}</p>
                <p className="text-brown-light">{selectedOrder.mobile_number}</p>
                <p className="text-brown-light">{selectedOrder.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-brown-light">Delivery Address</p>
                <p className="text-brown-light">{selectedOrder.address_line}</p>
                <p className="text-brown-light">{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pin_code}</p>
              </div>
            </div>

            <div className="mb-5 text-sm">
              <p className="text-xs uppercase text-brown-light mb-1">Payment</p>
              <p className="text-brown-light">{selectedOrder.payment?.payment_method} — {selectedOrder.payment?.payment_status}</p>
            </div>

            <div className="border-t border-beige-dark pt-4">
              <p className="text-xs uppercase text-brown-light mb-2">Items</p>
              {selectedOrder.items.map((item) => (
                <div key={item.order_item_id} className="flex justify-between text-sm mb-2">
                  <span className="text-brown-light">{item.product_name} × {item.quantity}</span>
                  <span className="text-brown font-medium">{formatPrice(item.line_total)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-brown border-t border-beige-dark pt-2 mt-2">
                <span>Total</span><span>{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
