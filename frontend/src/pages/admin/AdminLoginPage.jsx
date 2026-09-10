// src/pages/admin/AdminLoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      const isRateLimited = err.message?.toLowerCase().includes('too many');
      showToast(isRateLimited ? err.message : 'Invalid email or password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown px-4">
      <div className="bg-cream rounded-sm p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display italic text-2xl text-maroon">House of Jaee</span>
          <div className="flex items-center justify-center gap-2 mt-3">
            <FiLock size={16} className="text-brown" />
            <h1 className="font-display text-xl text-brown">Admin Panel Login</h1>
          </div>
          <p className="text-sm text-brown-light mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@houseofjaee.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-brown">Password</label>
              <Link to="/admin/forgot-password" className="text-xs text-maroon hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-brown-light text-center mt-6">
          For security, repeated failed attempts will temporarily lock login access.
        </p>
      </div>
    </div>
  );
}