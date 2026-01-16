import express from 'express';
import userAuth from '../middleware/userAuth.js';
import roleAuth from '../middleware/roleAuth.js';
import {
    getUserData,
    getUserDashboard,
    getModeratorDashboard,
    getAdminDashboard,
    getAllUsers,
    updateUserRole
} from '../controllers/userController.js';

const userRouter = express.Router();

// Basic user data
userRouter.get('/data', userAuth, getUserData);

// Dashboard routes - role-based
userRouter.get('/dashboard/user', userAuth, getUserDashboard);
userRouter.get('/dashboard/moderator', userAuth, roleAuth(['admin', 'moderator']), getModeratorDashboard);
userRouter.get('/dashboard/admin', userAuth, roleAuth('admin'), getAdminDashboard);

// Admin management routes
userRouter.get('/all-users', userAuth, roleAuth('admin'), getAllUsers);
userRouter.put('/update-role', userAuth, roleAuth('admin'), updateUserRole);

// Legacy routes (kept for backwards compatibility)
userRouter.get('/admin-data', userAuth, roleAuth('admin'), (req, res) => {
    res.json({ 
        success: true, 
        message: "Admin data access granted",
        timestamp: new Date().toISOString() 
    });
});

userRouter.get('/moderator-data', userAuth, roleAuth(['admin', 'moderator']), (req, res) => {
    res.json({ 
        success: true, 
        message: "Moderator data access granted",
        userRole: req.body.role,
        timestamp: new Date().toISOString() 
    });
});

export default userRouter;