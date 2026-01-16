# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Project Include Things,

    What's Currently Implemented:
    Authentication Features:
        User Registration - with password hashing (bcrypt)
        User Login - with JWT token authentication
        User Logout - clears authentication cookies
        Email Verification - OTP-based account verification
        Password Reset - OTP-based password reset via email
        JWT Token Management - HTTP-only cookies for security
        Middleware Protection - userAuth middleware for protected routes
        Basic User Data Retrieval - get user profile information

    What's Missing (Important Authorization & Security Features):
        1. Role-Based Access Control (RBAC)
        2. Enhanced Authorization Middleware
        3. Account Security Features
            Two-Factor Authentication (2FA)
            Login attempt limiting/rate limiting
            Device/session management
            Suspicious activity detection
            Account lockout after failed attempts
        4. Token Management
            Refresh token mechanism
            Token blacklisting for logout
            Multiple device session management
        5. Password Security
            Password strength validation
            Password history (prevent reusing old passwords)
            Password expiry policies
        6. Audit & Logging
            Login/logout logging
            Failed authentication attempts
            User activity tracking
            Security event logging
        7. API Security
            Rate limiting
            CORS configuration
            Input validation middleware
            SQL injection protection
            XSS protection headers
        8. Profile Management
            Update profile information
            Change password (while logged in)
            Delete account
            Profile picture upload

        Recommended Additions:
            Add Role-Based Authorization
            Implement Rate Limiting
            Add Input Validation
            Implement Refresh Tokens
            Add Security Headers
            Implement Account Lockout
            Add Audit Logging
            Enhance Profile Management
