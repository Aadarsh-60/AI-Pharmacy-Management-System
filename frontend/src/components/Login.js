import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        formData
      );

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', formData.email.toLowerCase());
        if (response.data.user) {
          if (response.data.user.role) localStorage.setItem('role', response.data.user.role);
          if (response.data.user.name) localStorage.setItem('name', response.data.user.name);
        }
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

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        { email: 'vikramaadarsh1999@gmail.com', password: '12345' }
      );
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', 'vikramaadarsh1999@gmail.com');
        if (response.data.user) {
          if (response.data.user.role) localStorage.setItem('role', response.data.user.role);
          if (response.data.user.name) localStorage.setItem('name', response.data.user.name);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Demo login failed. Server may be starting up, try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 - Send Code
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setForgotError('Please enter your email'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/forgot-password`, { email: forgotEmail });
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/reset-password`, {
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
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  );

  const inputClass = "w-full rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 70%)', top: '-10%', left: '-10%', animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="absolute w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #764ba2 0%, transparent 70%)', bottom: '-5%', right: '-5%', animation: 'float 10s ease-in-out infinite reverse' }}></div>
        <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f093fb 0%, transparent 70%)', top: '50%', left: '60%', animation: 'float 12s ease-in-out infinite' }}></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}></div>
        <div className="absolute text-4xl opacity-10" style={{ top: '15%', left: '10%', animation: 'floatIcon 6s ease-in-out infinite' }}>💊</div>
        <div className="absolute text-3xl opacity-10" style={{ top: '70%', left: '15%', animation: 'floatIcon 8s ease-in-out infinite 1s' }}>🧪</div>
        <div className="absolute text-4xl opacity-10" style={{ top: '25%', right: '12%', animation: 'floatIcon 7s ease-in-out infinite 2s' }}>💉</div>
        <div className="absolute text-3xl opacity-10" style={{ bottom: '20%', right: '18%', animation: 'floatIcon 9s ease-in-out infinite 0.5s' }}>🏥</div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Back to Home */}
        <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </button>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
          
          {/* ===== LOGIN VIEW ===== */}
          {forgotStep === 0 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ animation: 'pulse 3s ease-in-out infinite' }}>
                  <span className="text-3xl">💊</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">Welcome Back</h2>
                <p className="text-gray-300 text-sm">Sign in to your pharmacy dashboard</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm text-sm">{error}</div>
              )}

              <div className="mb-5">
                <button type="button" onClick={handleDemoLogin} disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50">
                  ⚡ Test With Demo User
                </button>
              </div>

              <div className="flex items-center my-5">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 text-gray-400 text-sm">or login manually</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required className={inputClass + " pr-12"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button type="button" onClick={() => { setForgotStep(1); setForgotError(''); setForgotEmail(formData.email || ''); }}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">Don't have an account?{' '}
                  <button onClick={() => navigate('/register')} className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors">Register here</button>
                </p>
              </div>
            </>
          )}

          {/* ===== FORGOT PASSWORD: STEP 1 - ENTER EMAIL ===== */}
          {forgotStep === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🔑</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">Forgot Password</h2>
                <p className="text-gray-300 text-sm">Enter your email to receive a reset code</p>
              </div>

              {forgotError && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm text-sm">{forgotError}</div>
              )}

              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Enter your registered email" required className={inputClass} />
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 transform hover:scale-[1.02]">
                  {forgotLoading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => { setForgotStep(0); setForgotError(''); }} className="text-gray-400 hover:text-white text-sm transition-colors">
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* ===== FORGOT PASSWORD: STEP 2 - ENTER CODE + NEW PASSWORD ===== */}
          {forgotStep === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🔒</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-gray-300 text-sm">Check <strong className="text-indigo-300">{forgotEmail}</strong> for the 6-digit code</p>
              </div>

              {forgotError && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm text-sm">{forgotError}</div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">6-Digit Reset Code</label>
                  <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="Enter 6-digit code from email" required maxLength={6}
                    className={inputClass + " text-center text-xl tracking-[0.5em] font-mono"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required className={inputClass + " pr-12"} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      <EyeIcon show={showNewPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter new password" required className={inputClass} />
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 transform hover:scale-[1.02]">
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <button onClick={() => { setForgotStep(1); setForgotError(''); }} className="text-gray-400 hover:text-white text-sm transition-colors block mx-auto">
                  ← Back to Enter Email
                </button>
                <button onClick={() => { setForgotStep(0); setForgotError(''); }} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors block mx-auto">
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">AI-Powered Pharmacy Management System • Secure & Reliable</p>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0px); } 25% { transform: translateY(-15px) rotate(5deg); } 75% { transform: translateY(10px) rotate(-3deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 20px 5px rgba(99,102,241,0.2); } }
      `}</style>
    </div>
  );
};

export default Login;
