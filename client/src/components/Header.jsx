import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom';


const Header = () => {

  const {userData} = useContext(AppContext);
  const navigate = useNavigate();


  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center'>
      {/* Avatar/Icon */}
      <div className='relative mb-6'>
        <div className='w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl'>
          {userData ? (
            <span className='text-4xl sm:text-5xl font-bold text-white'>
              {userData.name[0].toUpperCase()}
            </span>
          ) : (
            <svg className='w-12 h-12 sm:w-16 sm:h-16 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          )}
        </div>
        {/* Decorative ring */}
        <div className='absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full animate-ping opacity-20'></div>
      </div>

      {/* Greeting */}
      <div className='mb-8'>
        <h1 className='flex items-center justify-center gap-2 text-2xl sm:text-4xl font-bold text-gray-900 mb-3'>
          Hey {userData ? userData.name : 'Developer'}!
          <span className='inline-block animate-wave text-3xl sm:text-4xl'>👋</span>
        </h1>
        <h2 className='text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
          Welcome to AuthBuilder
        </h2>
        <p className='text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed'>
          Let's start with a quick product tour and we'll have you up and running in no time!
        </p>
      </div>

      {/* Status Badge (if logged in) */}
      {userData && (
        <div className='mb-6 flex flex-wrap gap-3 justify-center'>
          {userData.isAccountVerified ? (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              Verified Account
            </span>
          ) : (
            <span className='inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-medium'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
              Unverified
            </span>
          )}
          
          <span className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-sm font-medium'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
            </svg>
            {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
          </span>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className='flex flex-wrap gap-4 justify-center'>
        {!userData ? (
          <button 
            className='group relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2' 
            onClick={() => navigate('/login')}
          >
            Get Started
            <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 7l5 5m0 0l-5 5m5-5H6' />
            </svg>
          </button>
        ) : (
          <>
            <button 
              className='px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-2' 
              onClick={() => navigate('/settings')}
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
              Settings
            </button>
            
            {(userData.role === 'admin' || userData.role === 'moderator') && (
              <button 
                className='px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2' 
                onClick={() => navigate('/admin-dashboard')}
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                </svg>
                {userData.role === 'admin' ? 'Admin' : 'Moderator'} Dashboard
              </button>
            )}
          </>
        )}
      </div>

      {/* Feature Highlights */}
      <div className='mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full'>
        <div className='p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all'>
          <div className='w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4'>
            <svg className='w-6 h-6 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>Secure Authentication</h3>
          <p className='text-gray-600 text-sm'>Industry-standard security with JWT and 2FA support</p>
        </div>

        <div className='p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all'>
          <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
            <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>Lightning Fast</h3>
          <p className='text-gray-600 text-sm'>Optimized performance for seamless user experience</p>
        </div>

        <div className='p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all'>
          <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>Easy Integration</h3>
          <p className='text-gray-600 text-sm'>Simple setup with comprehensive documentation</p>
        </div>
      </div>
    </div>
  )
}

export default Header