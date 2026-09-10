// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import ZariDivider from '../components/common/ZariDivider';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', mobileNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const { customerRegister } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customerRegister(form);
      showToast('Account created! Welcome to House of Jaee.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl text-maroon text-center mb-2">Create an Account</h1>
      <p className="text-brown-light text-center mb-8">Save your details for faster checkout next time.</p>
      <ZariDivider className="mb-8" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Full Name</label>
          <input type="text" required value={form.name} onChange={handleChange('name')} className="input-field" placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Email</label>
          <input type="email" required value={form.email} onChange={handleChange('email')} className="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Mobile Number</label>
          <input type="tel" value={form.mobileNumber} onChange={handleChange('mobileNumber')} className="input-field" placeholder="10-digit mobile number" maxLength={10} />
        </div>
        <div>
          <label className="block text-sm font-medium text-brown mb-1.5">Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={handleChange('password')} className="input-field" placeholder="At least 6 characters" />
        </div>
        <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-brown-light mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-maroon font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
