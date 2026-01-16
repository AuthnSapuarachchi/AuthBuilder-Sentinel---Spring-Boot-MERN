import React, { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp: otpString });
      
      if (data.success) {
        toast.success('Email verified successfully!');
        await getUserData(); // Refresh user data
        navigate('/'); // Redirect to home
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    try {
      setIsResending(true);
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
      
      if (data.success) {
        toast.success('Verification OTP sent successfully!');
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        inputRefs.current[0].focus(); // Focus first input
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Redirect if already verified
  useEffect(() => {
    if (userData && userData.isAccountVerified) {
      navigate('/');
    }
  }, [userData, navigate]);

  if (!isLoggedIn || (userData && userData.isAccountVerified)) {
    return null;
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-gray-50'>
      <div className='w-full max-w-md'>
        {/* Back Button */}
        <div className='mb-8'>
          <button 
            onClick={() => navigate('/')} 
            className='flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group'
          >
            <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            <span className='font-medium'>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Verify Your Email</h2>
          <p className='text-gray-600'>
            Enter the 6-digit code we sent to {userData?.email}
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>
          <form onSubmit={onSubmitHandler} className='space-y-6'>
            {/* OTP Input Fields */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3 text-center'>
                Verification Code
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

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting || otp.join('').length !== 6}
              className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {isSubmitting ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
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
          </form>
        </div>

        {/* Footer Help */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-600'>
            Having trouble?{' '}
            <button 
              onClick={() => navigate('/')}
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerify
