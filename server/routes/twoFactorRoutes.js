import express from 'express';
import { 
    setup2FA, 
    verify2FA, 
    disable2FA, 
    verifyLoginToken, 
    get2FAStatus, 
    regenerateBackupCodes 
} from '../controllers/twoFactorController.js';
import userAuth from '../middleware/userAuth.js';

const twoFactorRoutes = express.Router();

// Setup 2FA (generates QR code and backup codes)
twoFactorRoutes.post('/setup', userAuth, setup2FA);

// Verify and enable 2FA
twoFactorRoutes.post('/verify', userAuth, verify2FA);

// Disable 2FA
twoFactorRoutes.post('/disable', userAuth, disable2FA);

// Verify 2FA token during login
twoFactorRoutes.post('/verify-login', verifyLoginToken);

// Get 2FA status
twoFactorRoutes.get('/status', userAuth, get2FAStatus);

// Regenerate backup codes
twoFactorRoutes.post('/regenerate-codes', userAuth, regenerateBackupCodes);

export default twoFactorRoutes;
