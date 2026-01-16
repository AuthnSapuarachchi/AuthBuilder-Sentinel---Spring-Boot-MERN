import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const NavBar = () => {
  
    const navigate = useNavigate();
    const {userData, setUserData, setIsLoggedIn, backendUrl} = useContext(AppContext);

    const sendVerificationOtp = async () => {
      try {
        const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
        if (data.success) {
          navigate('/email-verify');
          toast.success('Verification email sent successfully');
        } else {
          toast.error(data.message || 'Failed to send verification email');
        }
      } catch (error) {
        console.error('Failed to send verification email:', error);
        toast.error(error.response?.data?.message || 'Failed to send verification email');
      }
    }

    const logout = async () => {
      try {
        const { data } = await axios.post(backendUrl + '/api/auth/logout');
        if (data.success) {
          setIsLoggedIn(false);
          setUserData(null);
          navigate('/');
          toast.success('Logged out successfully');
        } else {
          toast.error(data.message || 'Logout failed');
        }
      } catch (error) {
        console.error('Logout failed:', error);
        toast.error(error.response?.data?.message || 'Logout failed');
      }
    }

  return (
    <nav className='w-full bg-white border-b border-gray-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div 
            className='flex items-center gap-2 cursor-pointer group' 
            onClick={() => navigate('/')}
          >
            <div className='w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all'>
              AuthBuilder
            </span>
          </div>
          
          {/* User Menu / Auth Buttons */}
          {userData ? 
            <div className='relative group'>
              <button className='flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'>
                <div className='w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md'>
                  {userData.name[0].toUpperCase()}
                </div>
                <span className='hidden sm:block font-medium text-gray-700'>{userData.name}</span>
                <svg className='w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                {/* User Info Header */}
                <div className='px-4 py-3 border-b border-gray-100'>
                  <p className='text-sm font-medium text-gray-900'>{userData.name}</p>
                  <p className='text-xs text-gray-500 truncate'>{userData.email}</p>
                </div>
                
                {/* Menu Items */}
                <div className='py-1'>
                  {!userData.isAccountVerified && (
                    <button
                      onClick={sendVerificationOtp}
                      className='w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                      </svg>
                      Verify Email
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                    </svg>
                    Dashboard
                  </button>
                  
                  {(userData.role === 'admin' || userData.role === 'moderator') && (
                    <button
                      onClick={() => navigate('/admin-dashboard')}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                      </svg>
                      {userData.role === 'admin' ? 'Admin' : 'Moderator'} Dashboard
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/settings')}
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    Settings
                  </button>
                </div>
                
                {/* Logout */}
                <div className='border-t border-gray-100 pt-1'>
                  <button
                    onClick={logout}
                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          : 
            <div className='flex items-center gap-3'>
              <button 
                onClick={() => navigate('/login')} 
                className='px-5 py-2 text-gray-700 font-medium hover:text-indigo-600 transition-colors'
              >
                Login
              </button>
              
              <button 
                onClick={() => navigate('/login')} 
                className='px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              >
                Sign Up
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  )
}

export default NavBar
