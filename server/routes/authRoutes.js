import express from "express";
import {
  login,
  logout,
  register,
  verifyEmail,
  sendVerifyOtp,
  testEmail,
  testAuth,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  refreshToken,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";

const authRoutes = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Registration successful (OTP sent)
 *       400:
 *         description: User already exists or validation error
 */
authRoutes.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user with risk analysis
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful or 2FA required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 requires2FA:
 *                   type: boolean
 *                 email:
 *                   type: string
 *       403:
 *         description: Login blocked by risk engine
 *       429:
 *         description: Too many login attempts
 */
authRoutes.post("/login", loginRateLimiter, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRoutes.post("/logout", logout);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
authRoutes.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/send-verify-otp:
 *   post:
 *     summary: Send email verification OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       429:
 *         description: Rate limit exceeded
 */
authRoutes.post("/send-verify-otp", loginRateLimiter, userAuth, sendVerifyOtp);

/**
 * @swagger
 * /api/auth/verify-account:
 *   post:
 *     summary: Verify account with OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
authRoutes.post("/verify-account", userAuth, verifyEmail);

/**
 * @swagger
 * /api/auth/is-auth:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Not authenticated
 */
authRoutes.get("/is-auth", userAuth, isAuthenticated);

/**
 * @swagger
 * /api/auth/send-reset-otp:
 *   post:
 *     summary: Send password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset OTP sent successfully
 *       400:
 *         description: User not found
 */
authRoutes.post("/send-reset-otp", sendResetOtp);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or user not found
 */
authRoutes.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/test-email:
 *   get:
 *     summary: Test email service
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Test email sent
 */
authRoutes.get("/test-email", testEmail);

/**
 * @swagger
 * /api/auth/test-auth:
 *   post:
 *     summary: Test authentication middleware
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication working
 */
authRoutes.post("/test-auth", userAuth, testAuth);

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
authRoutes.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
}); // Simple health check

export default authRoutes;
