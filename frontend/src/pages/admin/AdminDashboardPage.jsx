// src/pages/admin/AdminDashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingCart, FiDollarSign, FiClock } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/format';
import DashboardCard from '../../components/admin/DashboardCard';
import { FullPageSpinner } from '../../components/common/Spinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          orderService.getDashboardStats(),
          orderService.getAllAdmin({ limit: 6 }),
        ]);
        setStats(statsRes.data.stats);
        setRecentOrders(ordersRes.data.orders);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl text-brown mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <DashboardCard icon={FiBox} label="Total Products" value={stats.totalProducts} accent="maroon" />
        <DashboardCard icon={FiShoppingCart} label="Total Orders" value={stats.totalOrders} accent="gold" />
        <DashboardCard icon={FiDollarSign} label="Revenue" value={formatPrice(stats.revenue)} accent="green" />
        <DashboardCard icon={FiClock} label="Pending Orders" value={stats.pendingOrders} accent="amber" />
      </div>

      <div className="bg-white border border-beige-dark rounded-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-beige-dark">
          <h2 className="font-display text-lg text-brown">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-maroon hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brown-light border-b border-beige-dark">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.order_id} className="border-b border-beige-dark/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-brown">{order.order_number}</td>
                  <td className="px-5 py-3 text-brown-light">{order.customer_name}</td>
                  <td className="px-5 py-3 text-brown-light">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3 text-brown">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-sm font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
