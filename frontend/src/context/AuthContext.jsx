// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Rehydrate sessions on first load using stored tokens.
  useEffect(() => {
    (async () => {
      const customerToken = localStorage.getItem('hoj_customer_token');
      const adminToken = localStorage.getItem('hoj_admin_token');

      try {
        if (customerToken) {
          const res = await authService.customerProfile();
          setCustomer(res.data.customer);
        }
      } catch {
        localStorage.removeItem('hoj_customer_token');
      }

      try {
        if (adminToken) {
          const res = await authService.adminProfile();
          setAdmin(res.data.admin);
        }
      } catch {
        localStorage.removeItem('hoj_admin_token');
      }

      setLoadingAuth(false);
    })();
  }, []);

  // ---- Customer ----
  const customerLogin = useCallback(async (email, password) => {
    const res = await authService.customerLogin({ email, password });
    localStorage.setItem('hoj_customer_token', res.data.token);
    setCustomer(res.data.customer);
    return res.data.customer;
  }, []);

  const customerRegister = useCallback(async (payload) => {
    const res = await authService.customerRegister(payload);
    localStorage.setItem('hoj_customer_token', res.data.token);
    setCustomer(res.data.customer);
    return res.data.customer;
  }, []);

  const customerLogout = useCallback(() => {
    localStorage.removeItem('hoj_customer_token');
    setCustomer(null);
  }, []);

  // ---- Admin ----
  const adminLogin = useCallback(async (email, password) => {
    const res = await authService.adminLogin({ email, password });
    localStorage.setItem('hoj_admin_token', res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem('hoj_admin_token');
    setAdmin(null);
  }, []);

  const value = {
    customer,
    admin,
    loadingAuth,
    customerLogin,
    customerRegister,
    customerLogout,
    adminLogin,
    adminLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
