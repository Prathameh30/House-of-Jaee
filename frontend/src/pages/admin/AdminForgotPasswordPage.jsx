// src/pages/admin/AdminForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.adminForgotPassword(email.trim());
      // Backend always returns a generic success response, whether or not
      // the email exists — we just show that same message here.
      setSent(true);
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
          <h1 className="font-display text-xl text-brown mt-3">Reset Admin Password</h1>
          <p className="text-sm text-brown-light mt-1">
            {sent ? 'Check your inbox' : "Enter your admin email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <FiCheckCircle size={40} className="text-green-600 mx-auto mb-4" />
            <p className="text-sm text-brown-light leading-relaxed mb-6">
              If an account exists for <span className="font-medium text-brown">{email}</span>, a password
              reset link has been sent. The link expires in 15 minutes.
            </p>
            <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-maroon hover:underline">
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Admin Email</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9"
                  placeholder="admin@houseofjaee.com"
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 text-sm text-brown-light hover:text-maroon mt-2"
            >
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}