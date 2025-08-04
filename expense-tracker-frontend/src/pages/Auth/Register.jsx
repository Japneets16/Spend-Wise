// Register page component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    userPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.userName || !formData.userEmail || !formData.userPhone || !formData.userPassword) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (formData.userPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.userPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.userPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...apiData } = formData;
      apiData.userPhone = parseInt(apiData.userPhone); // Convert to number
      
      // Call register API
      const response = await authAPI.register(apiData);
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">💰</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-green-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter your username"
                value={formData.userName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="userEmail"
                name="userEmail"
                type="email"
                required
                className="input-field mt-1"
                placeholder="Enter your email"
                value={formData.userEmail}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="userPhone"
                name="userPhone"
                type="tel"
                required
                className="input-field mt-1"
                placeholder="Enter your 10-digit phone number"
                value={formData.userPhone}
                onChange={handleChange}
                disabled={loading}
                maxLength="10"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="userPassword"
                  name="userPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={formData.userPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-600">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>At least 8 characters</li>
              <li>At least 1 uppercase letter</li>
              <li>At least 1 lowercase letter</li>
              <li>At least 1 number</li>
              <li>At least 1 special character</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;