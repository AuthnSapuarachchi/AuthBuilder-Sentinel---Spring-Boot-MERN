import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import userModel from '../model/usermodel.js';

// Generate 2FA secret and QR code
export const setup2FA = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({ 
                success: false, 
                message: "2FA is already enabled. Disable it first to set up again." 
            });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `AuthCodeLab (${user.email})`,
            issuer: 'AuthCodeLab'
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Generate backup codes (10 codes)
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push(code);
        }

        // Save secret and backup codes temporarily (not enabled yet)
        user.twoFactorSecret = secret.base32;
        user.backupCodes = backupCodes;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "2FA setup initiated. Scan QR code and verify to enable.",
            data: {
                qrCode: qrCodeUrl,
                secret: secret.base32,
                backupCodes: backupCodes,
                manualEntryKey: secret.base32
            }
        });

    } catch (error) {
        console.error('Setup 2FA error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Verify and enable 2FA
export const verify2FA = async (req, res) => {
    try {
        const { userId, token } = req.body;

        if (!token || token.length !== 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid token format. Token must be 6 digits." 
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({ 
                success: false, 
                message: "2FA not set up. Please set up 2FA first." 
            });
        }

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 steps before and after
        });

        if (!verified) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid verification code. Please try again." 
            });
        }

        // Enable 2FA
        user.twoFactorEnabled = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "2FA enabled successfully!",
            backupCodes: user.backupCodes
        });

    } catch (error) {
        console.error('Verify 2FA error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: "Password is required to disable 2FA" 
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify password
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }

        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = '';
        user.backupCodes = [];
        await user.save();

        return res.status(200).json({
            success: true,
            message: "2FA disabled successfully"
        });

    } catch (error) {
        console.error('Disable 2FA error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Verify 2FA token during login
export const verifyLoginToken = async (req, res) => {
    try {
        const { email, token, isBackupCode } = req.body;

        if (!email || !token) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and token are required" 
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ 
                success: false, 
                message: "2FA is not enabled for this account" 
            });
        }

        let verified = false;

        if (isBackupCode) {
            // Check if backup code is valid
            const codeIndex = user.backupCodes.indexOf(token.toUpperCase());
            if (codeIndex !== -1) {
                // Remove used backup code
                user.backupCodes.splice(codeIndex, 1);
                await user.save();
                verified = true;
            }
        } else {
            // Verify TOTP token
            verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token,
                window: 2
            });
        }

        if (!verified) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid verification code" 
            });
        }

        // Generate tokens (same as login)
        const jwt = await import('jsonwebtoken');
        const accessToken = jwt.default.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.default.sign(
            { id: user._id }, 
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: '7d' }
        );

        // Save refresh token
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        await user.save();

        // Set cookies
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "2FA verification successful",
            remainingBackupCodes: user.backupCodes.length
        });

    } catch (error) {
        console.error('Verify login token error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Get 2FA status
export const get2FAStatus = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId).select('twoFactorEnabled backupCodes');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                enabled: user.twoFactorEnabled,
                backupCodesRemaining: user.backupCodes ? user.backupCodes.length : 0
            }
        });

    } catch (error) {
        console.error('Get 2FA status error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Regenerate backup codes
export const regenerateBackupCodes = async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: "Password is required" 
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ 
                success: false, 
                message: "2FA is not enabled" 
            });
        }

        // Verify password
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }

        // Generate new backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push(code);
        }

        user.backupCodes = backupCodes;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Backup codes regenerated successfully",
            backupCodes: backupCodes
        });

    } catch (error) {
        console.error('Regenerate backup codes error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};
