import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  KeyRound,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { changePassword, deleteUserAccount } from '../services/authService';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say');

  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Profile save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender as any,
        emergencyContact: emergencyName
          ? {
              name: emergencyName.trim(),
              relationship: emergencyRelation.trim() || 'Contact',
              phone: emergencyPhone.trim() || '',
            }
          : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (!user) return;
    if (newPassword.length < 6) {
      setPassError('New password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    try {
      await changePassword(user.id, oldPassword, newPassword);
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPassSuccess(false);
        setShowPasswordChange(false);
      }, 2500);
    } catch (err: any) {
      setPassError(err?.message || 'Current password was incorrect.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await deleteUserAccount(user.id);
    await logout();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Profile
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identity credentials, contact information, and emergency health contact.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Profile Header Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {fullName.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {fullName || 'Your Name'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Shield className="w-3 h-3 text-emerald-500" />
                Verified Personal Vault
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98490 12345"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Emergency Contact (Optional)
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Designated contact for urgent medical situations or family document access.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Konda"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. Father, Spouse, Sibling"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98490 54321"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Security & Password Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Account Security &amp; Password
              </h4>
              <p className="text-xs text-slate-500">
                Update your vault authentication password anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {showPasswordChange ? 'Hide Form' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <form onSubmit={handleChangePassword} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              {passError && (
                <p className="text-xs text-rose-600 font-semibold">{passError}</p>
              )}
              {passSuccess && (
                <p className="text-xs text-emerald-600 font-semibold">
                  Password updated successfully!
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="password"
                  required
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <input
                  type="password"
                  required
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone: Logout and Delete Account */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Sign Out of Vault</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account &amp; Vault</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-semibold">
                Permanent deletion:
              </span>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-2xs"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
