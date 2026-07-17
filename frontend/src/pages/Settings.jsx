import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Phone, MapPin, Key, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    role: '',
    mobileNumber: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/auth/profile');
        const data = res.data.data;
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          role: data.role || '',
          mobileNumber: data.mobileNumber || '',
          address: data.address || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } catch (err) {
        toast.error('Failed to load profile settings');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validation for password change
    if (profile.newPassword || profile.confirmNewPassword) {
      if (!profile.currentPassword) {
        toast.error('Please enter your current password to change it');
        return;
      }
      if (profile.newPassword !== profile.confirmNewPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (profile.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }
    }

    setUpdating(true);
    try {
      const payload = {
        fullName: profile.fullName,
        mobileNumber: profile.mobileNumber,
        address: profile.address,
        currentPassword: profile.currentPassword || null,
        newPassword: profile.newPassword || null
      };

      const res = await apiClient.put('/auth/profile', payload);
      
      // Update session data
      const updatedUser = {
        ...user,
        fullName: res.data.data.fullName,
        email: res.data.data.email,
        role: res.data.data.role
      };
      localStorage.setItem('sms_user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');

      // Clear password fields
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));

      // If password was changed, prompt to re-login
      if (payload.newPassword) {
        toast.success('Password changed successfully. Please log in again.');
        setTimeout(() => {
          logout();
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile settings');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
          <SettingsIcon className="text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
          Account Settings
        </h1>
        <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
          Manage your personal details, contact information, and security password settings.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <RefreshCw className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm text-ink/60 dark:text-paper/60">Loading configuration settings...</p>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="glass rounded-badge p-6 border border-ink/5 dark:border-white/5 shadow-card space-y-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2 border-b border-ink/10 dark:border-white/10 pb-2 mb-4">
              <User size={18} className="text-indigo-500" />
              Personal Profile
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="input w-full bg-ink/5 dark:bg-white/5 cursor-not-allowed text-ink/50 dark:text-paper/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">User Account Role</label>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 capitalize">
                {profile.role.toLowerCase()}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Mobile Number</label>
              <input
                type="text"
                value={profile.mobileNumber}
                onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                className="input w-full"
                placeholder="e.g. +1 (555) 012-3456"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Residential Address</label>
              <textarea
                rows="3"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="input w-full resize-none py-2"
                placeholder="Enter your street address..."
              />
            </div>
          </div>

          {/* Security Details */}
          <div className="glass rounded-badge p-6 border border-ink/5 dark:border-white/5 shadow-card flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 border-b border-ink/10 dark:border-white/10 pb-2 mb-4">
                <Key size={18} className="text-amber-500" />
                Change Password
              </h2>

              <div className="bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 p-3 rounded-xl flex gap-2 mb-2">
                <SettingsIcon size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400 leading-normal">
                  Leave these fields blank if you do not wish to change your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Current Password</label>
                <input
                  type="password"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                  className="input w-full"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">New Password</label>
                <input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                  className="input w-full"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={profile.confirmNewPassword}
                  onChange={(e) => setProfile({ ...profile, confirmNewPassword: e.target.value })}
                  className="input w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="btn btn-indigo flex items-center gap-2 w-full md:w-auto"
              >
                {updating ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
