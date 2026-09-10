// src/components/admin/AdminSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiTag, FiPackage, FiMail, FiSettings, FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/products', label: 'Products', icon: FiShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/orders', label: 'Orders', icon: FiPackage },
  { to: '/admin/messages', label: 'Messages', icon: FiMail },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminSidebar() {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-brown text-cream min-h-screen flex flex-col shrink-0">
      <div className="px-6 py-6 border-b border-brown-light/30">
        <span className="font-display italic text-xl text-gold">House of Jaee</span>
        <p className="text-xs text-beige/70 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-colors ${
                isActive ? 'bg-maroon text-cream' : 'text-beige hover:bg-brown-light/30'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-brown-light/30">
        <p className="text-xs text-beige/70 mb-2">Signed in as</p>
        <p className="text-sm font-medium mb-3">{admin?.name}</p>
        <button
          onClick={() => { adminLogout(); navigate('/admin/login'); }}
          className="flex items-center gap-2 text-sm text-beige hover:text-gold transition-colors"
        >
          <FiLogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}