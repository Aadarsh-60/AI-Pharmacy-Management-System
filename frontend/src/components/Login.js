import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        formData
      );

      if (response.status === 200) {
        // Store token, email, name, and role in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', formData.email.toLowerCase()); // Store email in lowercase
        
        if (response.data.user) {
            if (response.data.user.role) {
                localStorage.setItem('role', response.data.user.role);
            }
            if (response.data.user.name) {
                localStorage.setItem('name', response.data.user.name);
            }
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
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Pre-fill and auto-submit
    setFormData({
      email: 'vikramaadarsh1999@gmail.com',
      password: '12345',
    });
    // Use a small timeout to let state update before auto-submitting
    setTimeout(() => {
      document.getElementById('loginFormSubmitBtn').click();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Login</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-bold shadow-md transform hover:scale-105 transition-all duration-300"
          >
            🚀 Test With Demo User
          </button>
        </div>
        
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">or login manually</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 transition-colors"
            />
          </div>
          <button
            id="loginFormSubmitBtn"
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

