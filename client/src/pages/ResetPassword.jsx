import React, { useState, useContext, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Handle input changes for OTP
  const handleInputChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  // Auto-focus first OTP input when OTP form is shown
  useEffect(() => {
    if (isOtpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOtpSent]);

  // Send OTP to email
  const sendResetOtp = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email });
      
      if (data.success) {
        toast.success('Reset OTP sent to your email!');
        setIsOtpSent(true);
        setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      } else {
        toast.error(data.message || 'Failed to send reset OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    try {
      setIsResending(true);
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email });
      
      if (data.success) {
        toast.success('Reset OTP sent again!');
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus(); // Focus first input
        }
      } else {
        toast.error(data.message || 'Failed to resend reset OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend reset OTP');
    } finally {
      setIsResending(false);
    }
  };

  // Reset password with OTP
  const resetPassword = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    if (!newPassword.trim()) {
      toast.error('Please enter your new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', {
        email,
        otp: otpString,
        newPassword
      });
      
      if (data.success) {
        toast.success('Password reset successfully!');
        navigate('/login');
      } else {
        toast.error(data.message || 'Password reset failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-gray-50'>
      <div className='w-full max-w-md'>
        {/* Back Button */}
        <div className='mb-8'>
          <button 
            onClick={() => navigate('/login')} 
            className='flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group'
          >
            <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            <span className='font-medium'>Back to Login</span>
          </button>
        </div>

        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            {!isOtpSent ? 'Reset Password' : 'Create New Password'}
          </h2>
          <p className='text-gray-600'>
            {!isOtpSent 
              ? 'Enter your email to receive a reset code' 
              : 'Enter the code and your new password'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>
          {!isOtpSent ? (
            // Step 1: Email Input Form
            <form onSubmit={sendResetOtp} className="space-y-6">
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email Address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    type="email" 
                    placeholder='you@example.com' 
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all'
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          ) : (
            // Step 2: OTP and New Password Form
            <form onSubmit={resetPassword} className="space-y-6">
              {/* Email Display */}
              <div className='p-4 bg-indigo-50 border border-indigo-100 rounded-lg'>
                <p className='text-sm text-gray-600'>
                  Code sent to:
                  <br />
                  <span className='text-gray-900 font-medium'>{email}</span>
                </p>
              </div>

              {/* OTP Input Fields */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3 text-center'>
                  Enter 6-Digit Code
                </label>
                <div className='flex justify-center gap-2 mb-4'>
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type='text'
                      maxLength='1'
                      value={data}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      onChange={(e) => handleInputChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className='w-12 h-14 text-center text-xl font-bold bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900'
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </div>

              {/* New Password Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  New Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                  </div>
                  <input 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    value={newPassword} 
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter new password' 
                    className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all'
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                    )}
                  </button>
                </div>
                <p className='text-xs text-gray-500 mt-1'>Must be at least 6 characters</p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting || otp.join('').length !== 6}
                className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Resend Code */}
              <div className='text-center pt-4 border-t border-gray-200'>
                <p className='text-gray-600 text-sm mb-2'>Didn't receive the code?</p>
                <button
                  type='button'
                  onClick={resendOtp}
                  disabled={isResending || isSubmitting}
                  className='text-indigo-600 font-medium hover:text-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isResending ? (
                    <div className='flex items-center justify-center gap-2'>
                      <div className='w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
                      Resending...
                    </div>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>

              {/* Back to Email */}
              <div className='text-center'>
                <button 
                  type='button'
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp(['', '', '', '', '', '']);
                    setNewPassword('');
                  }} 
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                >
                  ← Use different email
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-600'>
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/login')}
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
