import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import NavBar from '../components/NavBar.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    get2FAStatus();
  }, [isLoggedIn]);

  const get2FAStatus = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/2fa/status');
      if (data.success) {
        setTwoFactorEnabled(data.data.enabled);
        setBackupCodesCount(data.data.backupCodesRemaining || 0);
      }
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
    }
  };

  const handleEnable2FA = () => {
    console.log('Navigating to 2FA setup...');
    navigate('/2fa-setup');
  };

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(backendUrl + '/api/2fa/disable', { password });

      if (data.success) {
        toast.success('2FA disabled successfully');
        setTwoFactorEnabled(false);
        setBackupCodesCount(0);
        setShowDisableModal(false);
        setPassword('');
        await getUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    if (!regeneratePassword) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(backendUrl + '/api/2fa/regenerate-codes', {
        password: regeneratePassword
      });

      if (data.success) {
        toast.success('Backup codes regenerated successfully');
        setNewBackupCodes(data.backupCodes);
        setBackupCodesCount(data.backupCodes.length);
        setRegeneratePassword('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = newBackupCodes.join('\n');
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = '2fa-backup-codes-new.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Backup codes downloaded');
  };

  const closeRegenerateModal = () => {
    setShowRegenerateModal(false);
    setRegeneratePassword('');
    setNewBackupCodes([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Full Name</span>
                  <span className="text-sm font-semibold text-gray-900">{userData?.name}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Email Address</span>
                  <span className="text-sm font-semibold text-gray-900">{userData?.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Role</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1) || 'User'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-gray-600">Account Status</span>
                  {userData?.isAccountVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">Authentication Status</p>
                      {twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {twoFactorEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                    {twoFactorEnabled && (
                      <p className="text-xs text-gray-500 mt-2">
                        Backup codes remaining: <span className="font-semibold text-gray-700">{backupCodesCount}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!twoFactorEnabled ? (
                    <button
                      onClick={handleEnable2FA}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Enable 2FA
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowDisableModal(true)}
                        className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Disable 2FA
                      </button>
                      <button
                        onClick={() => setShowRegenerateModal(true)}
                        className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate Codes
                      </button>
                    </>
                  )}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">What is Two-Factor Authentication?</p>
                      <p className="text-xs text-blue-700">
                        2FA adds an extra layer of security by requiring a code from your authenticator app when you sign in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Security Tips Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Security Tips</h3>
              </div>
              
              <ul className="space-y-3">
                {[
                  'Use a strong, unique password',
                  'Enable two-factor authentication',
                  'Keep backup codes secure',
                  'Never share authentication codes',
                  'Review account activity regularly'
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Check our documentation or contact support for assistance.
              </p>
              <button className="w-full bg-white text-indigo-600 font-medium py-2.5 rounded-lg hover:bg-indigo-50 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Disable Two-Factor Authentication</h3>
              <p className="text-gray-600">
                Enter your password to confirm. This will make your account less secure.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setPassword('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={loading || !password}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Disabling...
                  </div>
                ) : (
                  'Disable 2FA'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Backup Codes Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            {newBackupCodes.length === 0 ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Regenerate Backup Codes</h3>
                  <p className="text-gray-600">
                    This will invalidate your old backup codes and generate new ones.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={regeneratePassword}
                    onChange={(e) => setRegeneratePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeRegenerateModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerateCodes}
                    disabled={loading || !regeneratePassword}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : (
                      'Regenerate'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">New Backup Codes</h3>
                  <p className="text-gray-600">Save these codes in a secure location.</p>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    {newBackupCodes.map((code, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 text-center font-mono text-sm font-bold text-gray-900">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-amber-800">
                      <strong>Important:</strong> Each code can only be used once. Download or save them securely!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={closeRegenerateModal}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
