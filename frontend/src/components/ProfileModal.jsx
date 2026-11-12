import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const ROLE_BADGES = {
  admin: {
    label: 'Store Owner (Admin)',
    icon: '👑',
    color: 'bg-amber-50 text-amber-700 border-amber-300',
    ring: 'ring-amber-500'
  },
  manager: {
    label: 'Store Manager',
    icon: '🩺',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    ring: 'ring-indigo-500'
  },
  user: {
    label: 'Staff Pharmacist',
    icon: '💼',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    ring: 'ring-emerald-500'
  }
};

const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'sessions'
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    pharmacyName: '',
    gstNo: ''
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/users/profile');
      if (res.data?.success && res.data?.user) {
        const u = res.data.user;
        setUserProfile(u);
        setProfileForm({
          name: u.name || '',
          pharmacyName: u.pharmacyName || '',
          gstNo: u.gstNo || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const res = await axiosInstance.get('/api/users/login-history');
      if (res.data?.success && Array.isArray(res.data?.logs)) {
        setSessions(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching login history:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage(null);
      fetchProfile();
      fetchLoginHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRole = userProfile?.role || localStorage.getItem('role') || 'user';
  const roleConfig = ROLE_BADGES[currentRole] || ROLE_BADGES.user;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await axiosInstance.put('/api/users/update-profile', profileForm);
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Pharmacy profile updated successfully!' });
        if (res.data.user?.name) localStorage.setItem('name', res.data.user.name);
        if (res.data.user?.pharmacyName) localStorage.setItem('pharmacyName', res.data.user.pharmacyName);
        if (onProfileUpdated) onProfileUpdated(res.data.user);
        fetchProfile();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Please check your current password.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors"
          >
            ×
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-indigo-700 font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/40">
              {getInitials(userProfile?.name || localStorage.getItem('name'))}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">
                  {userProfile?.name || localStorage.getItem('name') || 'Authorized User'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleConfig.color} flex items-center gap-1`}>
                  <span>{roleConfig.icon}</span>
                  <span>{roleConfig.label}</span>
                </span>
              </div>
              <p className="text-indigo-200 text-sm mt-0.5">
                {userProfile?.pharmacyName || localStorage.getItem('pharmacyName') || 'MediCare Pharmacy'}
              </p>
              <p className="text-indigo-300 text-xs mt-0.5 font-mono">
                {userProfile?.email || localStorage.getItem('email')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-indigo-600/40">
            <button
              onClick={() => { setActiveTab('profile'); setMessage(null); }}
              className={`pb-2.5 px-3 text-sm font-medium transition-colors relative ${
                activeTab === 'profile' ? 'text-white' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Pharmacy Profile
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('security'); setMessage(null); }}
              className={`pb-2.5 px-3 text-sm font-medium transition-colors relative ${
                activeTab === 'security' ? 'text-white' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Security & Password
              {activeTab === 'security' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('sessions'); setMessage(null); }}
              className={`pb-2.5 px-3 text-sm font-medium transition-colors relative ${
                activeTab === 'sessions' ? 'text-white' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Login History ({sessions.length})
              {activeTab === 'sessions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {message && (
            <div
              className={`p-3.5 mb-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Store / Pharmacy Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.pharmacyName}
                    onChange={(e) => setProfileForm({ ...profileForm, pharmacyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Aadarsh Super Specialty Medicos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Pharmacist / Owner Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.gstNo}
                    onChange={(e) => setProfileForm({ ...profileForm, gstNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="07AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Registered Email (Read-Only)
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email || localStorage.getItem('email')}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Status Pills */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-500 uppercase font-medium">Assigned Role</div>
                  <div className="font-bold text-gray-900 text-sm capitalize">{currentRole}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-500 uppercase font-medium">Verification</div>
                  <div className="font-bold text-emerald-600 text-sm">Verified ✓</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-500 uppercase font-medium">Total Logins</div>
                  <div className="font-bold text-indigo-600 text-sm">{userProfile?.loginCount || 1}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-500 uppercase font-medium">Security IP</div>
                  <div className="font-bold text-gray-700 text-xs truncate font-mono">
                    {userProfile?.lastLoginIP || '127.0.0.1'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800">
                🔒 Choose a strong password containing at least 6 characters. Changing your password will update your credentials across all store endpoints.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LOGIN SESSIONS & AUDIT LOGS */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Recent authentication events and security audits recorded for this account.
              </p>

              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No login history recorded yet.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  {sessions.map((log, index) => (
                    <div key={log._id || index} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          🔑
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {log.action || 'User Login'}
                          </div>
                          <div className="text-gray-500 font-mono text-[11px]">
                            IP: {log.ipAddress || '127.0.0.1'} • Role: {log.details?.role || 'user'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-gray-400 text-[11px]">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Session Active (JWT Valid)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

