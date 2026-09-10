// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageSpinner } from './Spinner';

export function AdminProtectedRoute({ children }) {
  const { admin, loadingAuth } = useAuth();
  if (loadingAuth) return <FullPageSpinner />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

export function CustomerProtectedRoute({ children }) {
  const { customer, loadingAuth } = useAuth();
  if (loadingAuth) return <FullPageSpinner />;
  if (!customer) return <Navigate to="/login" replace />;
  return children;
}
