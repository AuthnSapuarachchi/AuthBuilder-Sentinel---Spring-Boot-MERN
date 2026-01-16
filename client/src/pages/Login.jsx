import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const {backendUrl, setIsLoggedIn, getUserData} = useContext(AppContext);

  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'signup' || location.pathname === '/signup') {
      setState('Sign Up');
    } else {
      setState('Login');
    }
  }, [location]);
  
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password });

        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        // LOGIN FLOW
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password });

        if (data.success) {
          
          // Check for 2FA requirement
          if (data.requires2FA) {
            toast.info(data.message || 'Verification required'); 
            navigate('/2fa-verify', {
              state: {
                email: email
              }
            });
          } else {
            // Normal Login
            setIsLoggedIn(true);
            getUserData();
            navigate('/');
          }
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white p-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Brand */}
        <div className='text-center mb-10'>
          <h1 
            onClick={() => navigate('/')} 
            className='text-3xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors'
          >
            AuthBuilder
          </h1>
        </div>

        {/* Card */}
        <div className='bg-white border border-gray-200 rounded-lg p-8 shadow-sm'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
              {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className='text-gray-500 text-sm'>
              {state === 'Sign Up' 
                ? 'Sign up to get started' 
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className='space-y-4'>
            {state === 'Sign Up' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type='text'
                  placeholder='John Doe'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  required
                />
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type='email'
                placeholder='you@example.com'
                className='w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type='password'
                placeholder='••••••••'
                className='w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                required
              />
            </div>

            {state === 'Login' && (
              <div className='text-right'>
                <button
                  type='button'
                  onClick={() => navigate('/reset-password')}
                  className='text-sm text-indigo-600 hover:text-indigo-500'
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type='submit'
              className='w-full bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 transition-colors font-medium'
            >
              {state === 'Sign Up' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Footer Link */}
          <div className='mt-6 text-center text-sm'>
            {state === 'Sign Up' ? (
              <p className='text-gray-600'>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setState('Login');
                    navigate('/login');
                  }}
                  className='text-indigo-600 hover:text-indigo-500 font-medium'
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className='text-gray-600'>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setState('Sign Up');
                    navigate('/signup');
                  }}
                  className='text-indigo-600 hover:text-indigo-500 font-medium'
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back to Home Link */}
        <div className='mt-6 text-center'>
          <button
            onClick={() => navigate('/')}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
