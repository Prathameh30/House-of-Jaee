// src/layouts/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex bg-cream min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
