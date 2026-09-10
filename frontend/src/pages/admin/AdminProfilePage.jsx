// src/pages/admin/AdminProfilePage.jsx
import { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function AdminProfilePage() {
  const { admin } = useAuth();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({ name: admin?.name || '', email: admin?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.adminUpdateProfile(profileForm);
      showToast('Profile updated. Refresh to see changes reflected everywhere.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setSavingPw(true);
    try {
      await authService.adminChangePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast('Password changed successfully.', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-brown mb-6">Admin Settings</h1>
      </div>

      {/* Profile details */}
      <section className="bg-white border border-beige-dark rounded-sm p-6">
        <h2 className="font-display text-lg text-brown mb-4 flex items-center gap-2">
          <FiUser size={18} className="text-maroon" /> Profile Details
        </h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Email</label>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field"
            />
          </div>
          <Button type="submit" size="md" className="self-start" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className="bg-white border border-beige-dark rounded-sm p-6">
        <h2 className="font-display text-lg text-brown mb-4 flex items-center gap-2">
          <FiLock size={18} className="text-maroon" /> Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown"
              >
                {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              className="input-field"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">Confirm New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className="input-field"
            />
          </div>
          <Button type="submit" size="md" className="self-start" disabled={savingPw}>
            {savingPw ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </section>
    </div>
  );
}