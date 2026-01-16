import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const TwoFactorVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  const email = location.state?.email;
  const tempToken = location.state?.tempToken;

  useEffect(() => {
    if (!email || !tempToken) {
      toast.error('Invalid access. Please login again.');
      navigate('/login');
    }
  }, [email, tempToken, navigate]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('');
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
    
    if (pastedData.length === 6) {
      document.getElementById('code-5')?.focus();
    }
  };

  const verify2FA = async () => {
    const verificationCode = useBackupCode ? backupCode : code.join('');

    if (!useBackupCode && verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    if (useBackupCode && backupCode.length !== 8) {
      toast.error('Backup code must be 8 characters');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        backendUrl + '/api/2fa/verify-login',
        { 
          email: email,
          token: verificationCode,
          isBackupCode: useBackupCode
        }
      );

      if (data.success) {
        toast.success('Login successful!');
        setIsLoggedIn(true);
        await getUserData();
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify2FA();
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
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>Two-Factor Authentication</h2>
          <p className='text-gray-600'>
            {useBackupCode 
              ? 'Enter your 8-character backup code' 
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {!useBackupCode ? (
              // 6-digit code input
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3 text-center'>
                  Authenticator Code
                </label>
                <div className='flex justify-center gap-2 mb-4'>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type='text'
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className='w-12 h-14 text-center text-xl font-bold bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900'
                      maxLength='1'
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Backup code input
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Backup Code
                </label>
                <input
                  type='text'
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase().slice(0, 8))}
                  placeholder='XXXXXXXX'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase'
                  maxLength='8'
                  disabled={loading}
                />
                <p className='text-xs text-gray-500 mt-1 text-center'>Enter one of your 8-character backup codes</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading || (!useBackupCode && code.join('').length !== 6) || (useBackupCode && backupCode.length !== 8)}
              className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Verifying...
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Toggle Backup Code */}
            <div className='text-center pt-4 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode(['', '', '', '', '', '']);
                  setBackupCode('');
                }}
                className='text-indigo-600 font-medium hover:text-indigo-500 transition-colors text-sm'
              >
                {useBackupCode ? '← Use authenticator code' : 'Use backup code instead →'}
              </button>
            </div>
          </form>

          {/* Help Info */}
          <div className='mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg'>
            <div className='flex items-start gap-3'>
              <svg className='w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
              </svg>
              <div>
                <p className='text-sm text-gray-700 font-medium mb-1'>Lost your authenticator?</p>
                <p className='text-xs text-gray-600'>Use one of your backup codes to regain access to your account.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-sm text-gray-600'>
            Need help?{' '}
            <button 
              onClick={() => navigate('/login')}
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
