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
  const otpInputs = React.useRef([]);

  React.useEffect(() => {
    if (verificationStep && otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, [verificationStep]);

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
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-teal-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 6 characters and include uppercase, lowercase, numbers, and a special character.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/register`, formData);
      setRegisteredEmail(formData.email);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', gstNo: '' });
      setVerificationStep(true);
      toast.success('Registration successful! Please check your email for the 6-digit code.', { duration: 5000 });
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
      await axiosInstance.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/verify-email`, {
        email: registeredEmail, verificationCode: verificationCode.trim()
      });
      toast.success('Email verified successfully! Redirecting to login...', { duration: 3000 });
      setTimeout(() => navigate('/login'), 2000);
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
      await axiosInstance.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/resend-verification`, { email: registeredEmail });
      toast.success('New 6-digit code sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendingCode(false);
    }
  };

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

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n);
    if (idx < 5 && val) otpInputs.current[idx + 1]?.focus();
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

  const renderEmailVerification = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/20 text-white">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Verify Your Email</h2>
        <p className="text-slate-500 text-xs sm:text-sm">We've sent a 6-digit code to <strong className="text-teal-700">{registeredEmail}</strong></p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{error}</div>
      )}

      <form onSubmit={handleVerifyCode} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">Enter 6-Digit Code</label>
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
                className="w-11 h-12 text-center text-xl font-bold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono shadow-sm"
                required
              />
            ))}
          </div>
        </div>

        <button type="submit" disabled={verifyingCode}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 shadow-md shadow-teal-600/20">
          {verifyingCode ? 'Verifying Code...' : 'Confirm & Activate Store Account'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Didn't receive the code?{' '}
            <button type="button" onClick={handleResendCode} disabled={resendingCode}
              className="font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50 transition-colors">
              {resendingCode ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
          <button type="button"
            onClick={() => { setVerificationStep(false); setError(''); setOtp(['', '', '', '', '', '']); }}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors block mx-auto font-medium">
            ← Back to Store Registration
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 text-slate-800 flex items-center justify-center py-10 px-4 relative">
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Back to Home */}
        <button onClick={() => navigate('/')} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-4 transition-colors text-sm font-semibold group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Medical Store Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 p-6 sm:p-8">
          
          {verificationStep ? (
            renderEmailVerification()
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/20 text-white">
                  <span className="text-2xl">📋</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Register Medical Store</h2>
                <p className="text-slate-500 text-xs sm:text-sm">Create an account for your pharmacy or medical shop</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Aadarsh Vikram" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="e.g. pharmacy@example.com" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={inputClass + " pr-12"} placeholder="Min 6 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'}`}></div>
                        ))}
                      </div>
                      <p className={`text-[11px] mt-0.5 font-medium ${passwordStrength.level <= 1 ? 'text-red-500' : passwordStrength.level <= 3 ? 'text-amber-500' : 'text-teal-600'}`}>
                        Strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass + " pr-12"} placeholder="Re-enter password" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number (Optional)</label>
                  <input type="text" name="gstNo" value={formData.gstNo} onChange={handleChange} className={inputClass + " uppercase font-mono"} placeholder="e.g. 07AAAAA0000A1Z5" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 shadow-md shadow-teal-600/20">
                  {loading ? 'Creating Store Account...' : 'Register Medical Store'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-slate-600 text-xs font-medium">Already have an account?{' '}
                  <button onClick={() => navigate('/login')} className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-colors">Sign in here</button>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-4 font-medium">
          ✓ Safe & Simple Medical Store Management Software • Fast Setup
        </p>
      </div>
    </div>
  );
};

export default Register;
