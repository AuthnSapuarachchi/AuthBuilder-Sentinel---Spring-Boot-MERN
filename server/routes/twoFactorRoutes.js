import express from "express";
import {
  setup2FA,
  verify2FA,
  disable2FA,
  verifyLoginToken,
  get2FAStatus,
  regenerateBackupCodes,
} from "../controllers/twoFactorController.js";
import userAuth from "../middleware/userAuth.js";

const twoFactorRoutes = express.Router();

/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user account
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6922bec1951a1839a8ac9687
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       description: QR code data URL
 *                     secret:
 *                       type: string
 *                       description: Base32 encoded secret
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: 2FA already enabled
 *       404:
 *         description: User not found
 */
twoFactorRoutes.post("/setup", userAuth, setup2FA);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify and enable 2FA
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6922bec1951a1839a8ac9687
 *               token:
 *                 type: string
 *                 example: "123456"
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid verification code or 2FA not set up
 *       404:
 *         description: User not found
 */
twoFactorRoutes.post("/verify", userAuth, verify2FA);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA for user account
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6922bec1951a1839a8ac9687
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid password
 *       404:
 *         description: User not found
 */
twoFactorRoutes.post("/disable", userAuth, disable2FA);

/**
 * @swagger
 * /api/2fa/verify-login:
 *   post:
 *     summary: Verify 2FA code during login
 *     tags: [Two-Factor Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               token:
 *                 type: string
 *                 example: "123456"
 *                 description: 6-digit TOTP code or 8-character backup code
 *               isBackupCode:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: 2FA verification successful, user logged in
 *       400:
 *         description: Invalid verification code or 2FA not enabled
 *       404:
 *         description: User not found
 */
twoFactorRoutes.post("/verify-login", verifyLoginToken);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Get 2FA status for current user
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 twoFactorEnabled:
 *                   type: boolean
 *                 backupCodesRemaining:
 *                   type: number
 *       404:
 *         description: User not found
 */
twoFactorRoutes.get("/status", userAuth, get2FAStatus);

/**
 * @swagger
 * /api/2fa/regenerate-codes:
 *   post:
 *     summary: Regenerate backup codes
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6922bec1951a1839a8ac9687
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Backup codes regenerated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid password or 2FA not enabled
 *       404:
 *         description: User not found
 */
twoFactorRoutes.post("/regenerate-codes", userAuth, regenerateBackupCodes);

export default twoFactorRoutes;
