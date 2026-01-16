import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, getUserData } = useContext(AppContext);

  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: QR, 2: Verify, 3: Backup Codes
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initSetup = async () => {
      if (!isLoggedIn) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      
      // Small delay to ensure authentication context is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      await setupTwoFactor();
    };
    
    initSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      console.log('Starting 2FA setup...');
      console.log('Backend URL:', backendUrl);
      console.log('Is Logged In:', isLoggedIn);
      
      const { data } = await axios.post(backendUrl + '/api/2fa/setup');
      
      console.log('2FA Setup Response:', data);
      
      if (data.success) {
        setQrCode(data.data.qrCode);
        setSecret(data.data.secret);
        setStep(1);
        toast.success(data.message || '2FA setup initiated successfully');
      } else {
        toast.error(data.message || 'Failed to setup 2FA');
        navigate('/settings');
      }
    } catch (error) {
      console.error('2FA Setup Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to setup 2FA';
      toast.error(errorMessage);
      
      // Only navigate back if not a 401 (handled by interceptor)
      if (error.response?.status !== 401) {
        navigate('/settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/2fa/verify', {
        token: verificationCode
      });

      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep(3);
        toast.success('2FA enabled successfully!');
        await getUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = '2fa-backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Backup codes downloaded');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const finishSetup = () => {
    navigate('/settings');
  };

  if (loading && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading 2FA Setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-gray-50'>
      <div className='w-full max-w-2xl'>
        {/* Back Button */}
        <div className='mb-8'>
          <button 
            onClick={() => navigate('/settings')} 
            className='flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group'
          >
            <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            <span className='font-medium'>Back to Settings</span>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-20 h-1 rounded transition-all ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <div className={`w-20 h-1 rounded transition-all ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>

        {/* Step 1: Scan QR Code */}
        {step === 1 && (
          <div>
            <div className='text-center mb-8'>
              <div className='w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>Setup 2FA</h2>
              <p className='text-gray-600'>Scan this QR code with Google Authenticator</p>
            </div>

            <div className="flex justify-center mb-6">
              {qrCode ? (
                <div className='p-4 bg-white border-4 border-gray-200 rounded-xl'>
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    className="w-64 h-64"
                    onError={() => {
                      console.error('QR Code failed to load');
                      toast.error('QR Code failed to load. Use manual entry code below.');
                    }}
                  />
                </div>
              ) : (
                <div className="w-72 h-72 border-4 border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading QR Code...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Manual Entry Code:</p>
              <div className="flex items-center justify-between gap-3">
                <code className="text-indigo-600 font-mono text-sm break-all flex-1">{secret}</code>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className='flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg'>
                <span className='text-xl'>📱</span>
                <div>
                  <p className='font-medium text-gray-900'>Step 1</p>
                  <p className="text-sm text-gray-600">Download Google Authenticator app</p>
                </div>
              </div>
              <div className='flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg'>
                <span className='text-xl'>📷</span>
                <div>
                  <p className='font-medium text-gray-900'>Step 2</p>
                  <p className="text-sm text-gray-600">Scan the QR code above or enter the code manually</p>
                </div>
              </div>
              <div className='flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg'>
                <span className='text-xl'>✅</span>
                <div>
                  <p className='font-medium text-gray-900'>Step 3</p>
                  <p className="text-sm text-gray-600">Click Next to verify your code</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Next: Verify Code →
            </button>
          </div>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <div>
            <div className='text-center mb-8'>
              <div className='w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>Verify Your Code</h2>
              <p className='text-gray-600'>Enter the 6-digit code from your authenticator app</p>
            </div>

            <div className="mb-8">
              <label className='block text-sm font-medium text-gray-700 mb-2 text-center'>
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-5 py-4 border-2 border-gray-300 text-gray-900 text-center text-3xl tracking-widest font-bold rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                maxLength="6"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Enable'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div>
            <div className='text-center mb-8'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>Save Backup Codes</h2>
              <p className='text-gray-600'>Store these codes safely for account recovery</p>
            </div>

            <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 text-center font-mono font-bold text-gray-900">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
              <div className='flex items-start gap-3'>
                <svg className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <div>
                  <p className='font-bold text-yellow-800 mb-1'>Important!</p>
                  <p className="text-sm text-yellow-700">
                    Each code can only be used once. Download and store them in a secure location!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadBackupCodes}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                </svg>
                Download Codes
              </button>
              <button
                onClick={finishSetup}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Finish Setup ✓
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
