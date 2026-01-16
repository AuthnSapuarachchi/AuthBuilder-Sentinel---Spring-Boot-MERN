import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import EmailVerify from './pages/EmailVerify.jsx'
import Settings from './pages/Settings.jsx'
import TwoFactorSetup from './pages/TwoFactorSetup.jsx'
import TwoFactorVerify from './pages/TwoFactorVerify.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Login />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/2fa-setup' element={<TwoFactorSetup />} />
        <Route path='/2fa-verify' element={<TwoFactorVerify />} />
        <Route path='/dashboard' element={<UserDashboard />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

export default App
