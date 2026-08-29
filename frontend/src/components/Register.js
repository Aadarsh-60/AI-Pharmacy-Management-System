import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', gstNo: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/users/register`, formData);
      setRegisteredEmail(formData.email);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', gstNo: '' });
      setVerificationStep(true);
      toast.success('Registration successful! Check your email for verification code.', { duration: 5000 });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const verificationCode = otp.join("");
    if (verificationCode.length < 6) { setError('Please enter the full 6-digit code'); return; }

    setVerifyingCode(true);
    setError('');
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/users/verify-email`, {
        email: registeredEmail, verificationCode: verificationCode.trim()
      });
      toast.success('Email verified successfully! Redirecting to login...', { duration: 3000 });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    setResendingCode(true);
    setError('');
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/users/resend-verification`, { email: registeredEmail });
      toast.success('Verification code resent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendingCode(false);
    }
  };

  // Eye icon
  const EyeIcon = ({ show }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  );

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm";

  // Loading overlay - dark theme
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
        <div className="relative mx-auto w-16 h-16">
          <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-400 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
        <p className="mt-4 text-white text-lg font-medium">Creating your account...</p>
        <p className="mt-2 text-gray-400 text-sm">Please wait while we set things up</p>
      </div>
    </div>
  );

  // Email Verification Component - dark theme
  const EmailVerification = () => {
    const otpInputs = React.useRef([]);

    const handleOtpChange = (e, idx) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      if (!val) { const n = [...otp]; n[idx] = ''; setOtp(n); return; }
      const n = [...otp]; n[idx] = val[0]; setOtp(n);
      if (idx < 5) otpInputs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (e, idx) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (otp[idx]) { const n = [...otp]; n[idx] = ''; setOtp(n); }
        else if (idx > 0) { const n = [...otp]; n[idx - 1] = ''; setOtp(n); otpInputs.current[idx - 1]?.focus(); }
      } else if (e.key === 'ArrowLeft' && idx > 0) otpInputs.current[idx - 1]?.focus();
      else if (e.key === 'ArrowRight' && idx < 5) otpInputs.current[idx + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
      if (pasted) {
        const n = [...otp];
        for (let i = 0; i < pasted.length && i < 6; i++) n[i] = pasted[i];
        setOtp(n);
        otpInputs.current[Math.min(pasted.length, 5)]?.focus();
      }
    };

    return (
      <>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Verify Your Email</h2>
          <p className="text-gray-300 text-sm">We've sent a code to <strong className="text-indigo-300">{registeredEmail}</strong></p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm text-sm">{error}</div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => otpInputs.current[idx] = el}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  autoFocus={idx === 0}
                  onChange={e => handleOtpChange(e, idx)}
                  onKeyDown={e => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  onFocus={e => e.target.select()}
                  className="w-12 h-12 text-center text-2xl font-bold rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                  required
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={verifyingCode}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg transform hover:scale-[1.02]">
            {verifyingCode ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : 'Verify Email'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Didn't receive the code?{' '}
              <button type="button" onClick={handleResendCode} disabled={resendingCode}
                className="font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors">
                {resendingCode ? 'Resending...' : 'Resend Code'}
              </button>
            </p>
            <button type="button"
              onClick={() => { setVerificationStep(false); setError(''); setOtp(['', '', '', '', '', '']); }}
              className="text-sm text-gray-500 hover:text-white transition-colors">
              ← Back to Registration
            </button>
          </div>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      
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

      {loading && <LoadingOverlay />}
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Back to Home */}
        <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </button>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
          
          {verificationStep ? (
            <EmailVerification />
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">📋</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">Create Account</h2>
                <p className="text-gray-300 text-sm">Join our pharmacy management system</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl backdrop-blur-sm text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Enter your full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="Enter your email" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={inputClass + " pr-12"} placeholder="Min 6 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-white/10'}`}></div>
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${passwordStrength.level <= 1 ? 'text-red-400' : passwordStrength.level <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass + " pr-12"} placeholder="Re-enter your password" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>
                  {/* Password match indicator */}
                  {formData.confirmPassword && (
                    <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                      {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">GST Number</label>
                  <input type="text" name="gstNo" value={formData.gstNo} onChange={handleChange} className={inputClass} placeholder="Enter your GST number" required />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02]">
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">Already have an account?{' '}
                  <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors">Sign in here</button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0px); } 25% { transform: translateY(-15px) rotate(5deg); } 75% { transform: translateY(10px) rotate(-3deg); } }
      `}</style>
    </div>
  );
};

export default Register;
