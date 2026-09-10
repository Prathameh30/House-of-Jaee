// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import ZariDivider from '../components/common/ZariDivider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { customerLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customerLogin(email, password);
      showToast('Welcome back!', 'success');
      navigate(redirectTo);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl text-maroon text-center mb-2">Welcome Back</h1>
      <p className="text-brown-light text-center mb-8">Sign in to track orders and check out faster.</p>
      <ZariDivider className="mb-8" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
        </div>
        <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-brown-light mt-6">
        New to House of Jaee?{' '}
        <Link to="/register" className="text-maroon font-medium hover:underline">Create an account</Link>
      </p>
      <p className="text-center text-sm text-brown-light mt-2">
        Prefer not to sign in?{' '}
        <Link to="/shop" className="text-maroon font-medium hover:underline">Continue as guest</Link>
      </p>
    </div>
  );
}
