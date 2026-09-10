// src/pages/admin/AdminResetPasswordPage.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown px-4">
        <div className="bg-cream rounded-sm p-8 md:p-10 w-full max-w-md text-center">
          <h1 className="font-display text-xl text-brown mb-3">Invalid Reset Link</h1>
          <p className="text-sm text-brown-light mb-6">
            This link is missing a reset token. Please request a new one.
          </p>
          <Link to="/admin/forgot-password">
            <Button size="lg">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await authService.adminResetPassword({ token, newPassword });
      showToast('Password reset successfully. Please sign in.', 'success');
      navigate('/admin/login');
    } catch (err) {
      showToast(err.message, 'error');
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
            <h1 className="font-display text-xl text-brown">Set New Password</h1>
          </div>
          <p className="text-sm text-brown-light mt-1">Choose a new password for your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="At least 8 characters"
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
            {errors.newPassword && <p className="text-xs text-red-700 mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Re-enter new password"
            />
            {errors.confirmPassword && <p className="text-xs text-red-700 mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}