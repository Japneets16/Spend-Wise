// OTP verification page for MFA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const OTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    
    try {
      // Call OTP verification API
      const response = await authAPI.verifyOTP(otpString);
      
      if (response.success) {
        toast.success('OTP verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Invalid OTP');
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'OTP verification failed');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    
    try {
      // Mock resend OTP - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('OTP sent successfully!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  // Auto-submit when all digits are entered
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && !loading) {
      handleVerifyOtp();
    }
  }, [otp]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">🔐</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify Your Identity
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to your registered email
          </p>
          <p className="text-sm font-medium text-primary">
            {user?.userEmail || 'your email'}
          </p>
        </div>

        {/* OTP Input */}
        <div className="mt-8">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <div>
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              'Verify OTP'
            )}
          </button>
        </div>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="font-medium text-primary hover:text-green-500 disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <span className="text-gray-400">
                Resend in {countdown}s
              </span>
            )}
          </p>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Login
          </button>
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Mode:</h3>
          <p className="text-xs text-blue-600">
            Use OTP: <strong>123456</strong> for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTP;