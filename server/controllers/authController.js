import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/usermodel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFICATION_TEMPLATE } from "../config/emailTemplates.js";

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

const riskEngine = require("../services/riskEngine.service");

// Helper functions for token generation
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Save refresh token to database
    newUser.refreshTokens = newUser.refreshTokens || [];
    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    // Set cookies with different expiration times
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    //sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to AuthCodeLab",
      text: `Hello ${name},\n\nWelcome to AuthCodeLab! We're excited to have you on board. Your account has been successfully created with email id: ${email}.\n\nBest regards,\nAuthCodeLab Team`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Welcome to AuthCodeLab!</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>We're excited to have you on board! Your account has been successfully created.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Account Details:</strong></p>
                        <p>📧 Email: ${email}</p>
                        <p>📅 Registration Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <p>Best regards,<br><strong>AuthCodeLab Team</strong></p>
                </div>
            `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent successfully to:", email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't return error - user registration was successful, just email failed
    }

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: "Please enter your 2FA code",
        email: user.email,
      });
    }
    // ============================================================
    // END OF INTEGRATION
    // ============================================================

    // Generate tokens (Only if NO Risk and NO 2FA)
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ success: true, requires2FA: false, message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Remove refresh token from database
    if (refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        const user = await userModel.findById(payload.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(
            (t) => t !== refreshToken
          );
          await user.save();
        }
      } catch (e) {
        // Ignore token errors on logout
        console.log("Token verification failed during logout, continuing...");
      }
    }

    // Clear both cookies
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("Send OTP request received:", { userId, body: req.body });

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      console.log("User not found with ID:", userId);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("User found:", {
      email: user.email,
      isVerified: user.isAccountVerified,
    });

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log("Generated OTP:", otp);

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();
    console.log("OTP saved to database successfully");

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP - AuthCodeLab",
      text: `Your OTP is ${otp}. Please verify your account using this OTP. This OTP will expire in 10 minutes.`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Account Verification</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Please use the following OTP to verify your account:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p><strong>⏰ This OTP will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                    <p>Best regards,<br><strong>AuthCodeLab Team</strong></p>
                </div>
            `,
    };

    try {
      console.log("Attempting to send OTP email...");
      await transporter.sendMail(mailOptions);
      console.log("OTP email sent successfully to:", user.email);
      return res
        .status(200)
        .json({ success: true, message: "Verification OTP sent successfully" });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      console.error("Email error details:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      details: "Check server logs for more details",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Test email function to debug SMTP issues
export const testEmail = async (req, res) => {
  try {
    // Test transporter configuration
    await transporter.verify();
    console.log("SMTP server is ready to take our messages");

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: "authn.sapuarachchi@gmail.com", // Send to your own email for testing
      subject: "SMTP Test Email - AuthCodeLab",
      text: "This is a test email to verify SMTP configuration is working correctly.",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">SMTP Test Email</h2>
                    <p>This is a test email to verify SMTP configuration is working correctly.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> ✅ SMTP Configuration Working</p>
                </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SMTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "SMTP Error",
      error: error.message,
      details: error.response || "No additional details",
      timestamp: new Date().toISOString(),
    });
  }
};

// Test auth middleware
export const testAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    return res.status(200).json({
      success: true,
      message: "Authentication working correctly",
      userId: userId,
      userEmail: user ? user.email : "User not found",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Test auth error",
      error: error.message,
    });
  }
};

//check user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "User is authenticated" });
  } catch (error) {
    res.json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP - AuthCodeLab",
      text: `Your OTP for password reset is ${otp}. This OTP will expire in 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    console.error("Send reset OTP error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//Reset password function
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Refresh Token Controller
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await userModel.findById(payload.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Token rotation: remove old refresh token, generate new ones
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set new cookies
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Refresh token expired. Please login again",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
