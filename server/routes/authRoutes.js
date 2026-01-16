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

authRoutes.post("/register", register);
authRoutes.post("/login", loginRateLimiter, login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post("/send-verify-otp",loginRateLimiter, userAuth, sendVerifyOtp);
authRoutes.post("/verify-account", userAuth, verifyEmail);
authRoutes.get("/is-auth", userAuth, isAuthenticated);
authRoutes.post("/send-reset-otp", sendResetOtp);
authRoutes.post("/reset-password", resetPassword);
authRoutes.get("/test-email", testEmail); // Test route for SMTP
authRoutes.post("/test-auth", userAuth, testAuth); // Test route for authentication
authRoutes.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
}); // Simple health check

export default authRoutes;
