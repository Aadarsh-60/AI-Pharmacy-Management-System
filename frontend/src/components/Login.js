import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DEMO_PERSONAS = [
  {
    roleName: 'Medical Store Owner',
    role: 'admin',
    icon: '👑',
    email: 'vikramaadarsh2001@gmail.com',
    password: '12345',
    color: 'from-amber-500 to-amber-600',
    cardBg: 'bg-amber-50/60 hover:bg-amber-50 border-amber-200/90 hover:border-amber-400',
    badge: 'Store Owner',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'See full store sales, profit, stock & reports'
  },
  {
    roleName: 'Store Manager',
    role: 'manager',
    icon: '🩺',
    email: 'vikramaadarsh1999@gmail.com',
    password: '12345',
    color: 'from-teal-500 to-teal-600',
    cardBg: 'bg-teal-50/60 hover:bg-teal-50 border-teal-200/90 hover:border-teal-400',
    badge: 'Manager',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    desc: 'Add new stock, manage bills & supplier returns'
  },
  {
    roleName: 'Billing Staff / Cashier',
    role: 'user',
    icon: '💼',
    email: 'ashishkumar57060@gmail.com',
    password: '12345',
    color: 'from-blue-500 to-blue-600',
    cardBg: 'bg-blue-50/60 hover:bg-blue-50 border-blue-200/90 hover:border-blue-400',
    badge: 'Cashier',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    desc: 'Make customer bills & print receipts'
  }
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersonaRole, setActivePersonaRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(0); // 0=login, 1=enter email, 2=enter code+newpass
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveUserSession = (data, fallbackEmail, fallbackRole) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', (data.email || fallbackEmail).toLowerCase());
    const role = data.role || data.user?.role || fallbackRole || 'user';
    localStorage.setItem('role', role);
    localStorage.setItem('name', data.user?.name || (role === 'admin' ? 'Store Owner' : role === 'manager' ? 'Store Manager' : 'Staff Pharmacist'));
    localStorage.setItem('pharmacyName', data.pharmacyName || data.user?.pharmacyName || 'Aadarsh Super Specialty Medicos');
    if (data.user?.lastLogin) {
      localStorage.setItem('lastLogin', data.user.lastLogin);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, formData);

      if (response.status === 200) {
        saveUserSession(response.data, formData.email, 'user');
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaLogin = async (persona) => {
    setLoading(true);
    setActivePersonaRole(persona.role);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: persona.email,
        password: persona.password
      });

      if (response.status === 200) {
        saveUserSession(response.data, persona.email, persona.role);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Demo Persona login failed:', err);
      setFormData({ email: persona.email, password: persona.password });
      setError(`Login as ${persona.roleName} failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setActivePersonaRole(null);
    }
  };

  // Forgot Password: Step 1 - Send Code
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setForgotError('Please enter your email'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post(`${API_BASE_URL}/api/users/forgot-password`, { email: forgotEmail });
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Step 2 - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setForgotError('Passwords do not match'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post(`${API_BASE_URL}/api/users/reset-password`, {
        email: forgotEmail, resetCode, newPassword
      });
      setForgotStep(0);
      setError('');
      setFormData({ email: forgotEmail, password: '' });
      alert('Password reset successful! Please login with your new password.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setForgotLoading(false);
    }
  };

  // Eye icon SVG
  const EyeIcon = ({ show }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      )}
    </svg>
  );

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm font-medium shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 text-slate-800 flex items-center justify-center p-4 relative">
      
      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto py-8">
        {/* Back to Home */}
        <button onClick={() => navigate('/')} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-4 transition-colors text-sm font-semibold group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Medical Store Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 p-6 sm:p-8">
          
          {/* ===== LOGIN VIEW ===== */}
          {forgotStep === 0 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/20 text-white">
                  <span className="text-2xl">💊</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">MedInventory Sign In</h2>
                <p className="text-slate-500 text-xs sm:text-sm">Manage medicine stock, customer bills, and store reports</p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* 1-Click Multi-Role Demo Switcher */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                    <span>⚡</span> One-Click Demo Login
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Click any role to enter</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {DEMO_PERSONAS.map((persona) => {
                    const isPersonaLoading = loading && activePersonaRole === persona.role;
                    return (
                      <button
                        key={persona.role}
                        type="button"
                        onClick={() => handlePersonaLogin(persona)}
                        disabled={loading}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group disabled:opacity-50 shadow-sm hover:shadow-md ${persona.cardBg}`}
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center text-lg shadow-sm flex-shrink-0 text-white`}>
                            {persona.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                                {persona.roleName}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${persona.badgeColor}`}>
                                {persona.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {persona.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-2">
                          {isPersonaLoading ? (
                            <svg className="animate-spin h-5 w-5 text-teal-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <span className="text-xs text-teal-700 font-bold group-hover:translate-x-1 transition-transform inline-block">
                              Enter →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="mx-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">or sign in with email</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" name="email" placeholder="e.g. pharmacy@example.com" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required className={inputClass + " pr-12"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button type="button" onClick={() => { setForgotStep(1); setForgotError(''); setForgotEmail(formData.email || ''); }}
                    className="text-teal-600 hover:text-teal-700 text-xs font-semibold transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all duration-200 shadow-md shadow-teal-600/20 disabled:opacity-50">
                  {loading && !activePersonaRole ? 'Signing in...' : 'Sign In to Store'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-slate-600 text-xs font-medium">Don't have an account?{' '}
                  <button onClick={() => navigate('/register')} className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-colors">Register your medical store</button>
                </p>
              </div>
            </>
          )}

          {/* ===== FORGOT PASSWORD: STEP 1 - ENTER EMAIL ===== */}
          {forgotStep === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md text-white">
                  <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset Password</h2>
                <p className="text-slate-500 text-xs">Enter your email to get a 6-digit verification code</p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{forgotError}</div>
              )}

              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="your-email@example.com" required className={inputClass} />
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50">
                  {forgotLoading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button onClick={() => { setForgotStep(0); setForgotError(''); }} className="text-teal-600 hover:text-teal-700 text-xs font-semibold transition-colors">
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* ===== FORGOT PASSWORD: STEP 2 - ENTER CODE & NEW PASSWORD ===== */}
          {forgotStep === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md text-white">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Set New Password</h2>
                <p className="text-slate-500 text-xs">Code sent to <span className="text-slate-900 font-semibold">{forgotEmail}</span></p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{forgotError}</div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Code</label>
                  <input type="text" maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="123456" required className={inputClass + " text-center tracking-widest text-lg font-mono"} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" required className={inputClass + " pr-12"} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      <EyeIcon show={showNewPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter new password" required className={inputClass} />
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50">
                  {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>

              <div className="mt-5 text-center space-y-2">
                <button onClick={() => { setForgotStep(1); setForgotError(''); }} className="text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors block mx-auto">
                  ← Back to Enter Email
                </button>
                <button onClick={() => { setForgotStep(0); setForgotError(''); }} className="text-teal-600 hover:text-teal-700 text-xs font-semibold transition-colors block mx-auto">
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-4 font-medium">
          ✓ Safe & Secure Medical Software • Fast GST Invoicing • Easy Stock Control
        </p>
      </div>
    </div>
  );
};

export default Login;
