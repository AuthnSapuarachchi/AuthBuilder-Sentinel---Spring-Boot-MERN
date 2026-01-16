import userModel from "../model/usermodel.js";


export const getUserData = async (req, res) => {
    try {
        const {userId} = req.body;
        console.log('Fetching user data for userId:', userId);

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await userModel.findById(userId).select('-password -__v');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, 
            userData: {
                name: user.name,
                email: user.email,
                role: user.role,
                isAccountVerified: user.isAccountVerified,
                twoFactorEnabled: user.twoFactorEnabled || false,
                createdAt: user.createdAt
            } 
    });

    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

// User Dashboard Data
export const getUserDashboard = async (req, res) => {
    try {
        console.log('getUserDashboard called');
        console.log('req.body:', req.body);
        console.log('req.cookies:', req.cookies);
        
        const { userId } = req.body;
        
        if (!userId) {
            console.error('No userId in request body');
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required. Please login again." 
            });
        }

        console.log('Fetching user dashboard for userId:', userId);
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            console.error('User not found for userId:', userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('User found:', user.name, user.email);

        // Calculate user stats
        const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const backupCodesCount = user.backupCodes ? user.backupCodes.length : 0;

        const dashboardData = {
            success: true,
            dashboard: {
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isAccountVerified,
                    twoFactorEnabled: user.twoFactorEnabled || false,
                    accountAge: `${accountAge} days`
                },
                stats: {
                    accountStatus: user.isAccountVerified ? 'Verified' : 'Unverified',
                    securityLevel: user.twoFactorEnabled ? 'High (2FA Enabled)' : 'Medium (Password Only)',
                    backupCodesRemaining: backupCodesCount,
                    activeSessions: user.refreshTokens ? user.refreshTokens.length : 0
                },
                recentActivity: {
                    lastLogin: new Date().toISOString(),
                    accountCreated: user.createdAt,
                    lastUpdated: user.updatedAt
                }
            }
        };

        console.log('Sending dashboard data successfully');
        res.json(dashboardData);

    } catch (error) {
        console.error('Error fetching user dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Moderator Dashboard Data
export const getModeratorDashboard = async (req, res) => {
    try {
        console.log('getModeratorDashboard called');
        console.log('req.body:', req.body);
        
        const { userId } = req.body;

        if (!userId) {
            console.error('No userId in request body');
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required. Please login again." 
            });
        }

        console.log('Fetching moderator dashboard for userId:', userId);
        const user = await userModel.findById(userId);
        
        if (!user) {
            console.error('User not found for userId:', userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('User found:', user.name, 'Role:', user.role);

        // Get all users for moderation stats
        const totalUsers = await userModel.countDocuments();
        const verifiedUsers = await userModel.countDocuments({ isAccountVerified: true });
        const unverifiedUsers = totalUsers - verifiedUsers;
        const users2FA = await userModel.countDocuments({ twoFactorEnabled: true });

        // Recent users (last 10)
        const recentUsers = await userModel.find()
            .select('name email createdAt isAccountVerified')
            .sort({ createdAt: -1 })
            .limit(10);

        console.log('Sending moderator dashboard data successfully');
        res.json({
            success: true,
            dashboard: {
                moderator: {
                    name: user.name,
                    role: user.role,
                    permissions: ['content_moderation', 'user_reports', 'view_analytics']
                },
                stats: {
                    totalUsers: totalUsers,
                    verifiedUsers: verifiedUsers,
                    unverifiedUsers: unverifiedUsers,
                    users2FA: users2FA,
                    pendingReports: 23, // Mock data - you can implement this later
                    resolvedToday: 8 // Mock data
                },
                recentUsers: recentUsers,
                tasks: {
                    pendingReviews: 12,
                    flaggedContent: 5,
                    userReports: 23
                }
            }
        });

    } catch (error) {
        console.error('Error fetching moderator dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Admin Dashboard Data
export const getAdminDashboard = async (req, res) => {
    try {
        console.log('getAdminDashboard called');
        console.log('req.body:', req.body);
        
        const { userId } = req.body;

        if (!userId) {
            console.error('No userId in request body');
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required. Please login again." 
            });
        }

        console.log('Fetching admin dashboard for userId:', userId);
        const user = await userModel.findById(userId);
        
        if (!user) {
            console.error('User not found for userId:', userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('User found:', user.name, 'Role:', user.role);

        // Get comprehensive stats
        const totalUsers = await userModel.countDocuments();
        const verifiedUsers = await userModel.countDocuments({ isAccountVerified: true });
        const users2FA = await userModel.countDocuments({ twoFactorEnabled: true });
        const adminUsers = await userModel.countDocuments({ role: 'admin' });
        const moderatorUsers = await userModel.countDocuments({ role: 'moderator' });
        const regularUsers = await userModel.countDocuments({ role: 'user' });

        // Recent users
        const recentUsers = await userModel.find()
            .select('name email role createdAt isAccountVerified twoFactorEnabled')
            .sort({ createdAt: -1 })
            .limit(10);

        // Users by role
        const usersByRole = await userModel.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate growth (mock data - you can implement real analytics)
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newUsersLast30Days = await userModel.countDocuments({ 
            createdAt: { $gte: last30Days } 
        });

        console.log('Sending admin dashboard data successfully');
        res.json({
            success: true,
            dashboard: {
                admin: {
                    name: user.name,
                    role: user.role,
                    permissions: ['full_access', 'user_management', 'system_config', 'security_settings']
                },
                overview: {
                    totalUsers: totalUsers,
                    verifiedUsers: verifiedUsers,
                    users2FA: users2FA,
                    newUsersThisMonth: newUsersLast30Days,
                    verificationRate: ((verifiedUsers / totalUsers) * 100).toFixed(1) + '%',
                    twoFactorAdoptionRate: ((users2FA / totalUsers) * 100).toFixed(1) + '%'
                },
                userDistribution: {
                    admins: adminUsers,
                    moderators: moderatorUsers,
                    regularUsers: regularUsers,
                    byRole: usersByRole
                },
                security: {
                    users2FA: users2FA,
                    usersWithoutEmail: totalUsers - verifiedUsers,
                    activeSessions: 0, // You can calculate this from refreshTokens
                    suspiciousActivity: 0 // Mock data
                },
                recentUsers: recentUsers,
                systemHealth: {
                    status: 'Healthy',
                    uptime: '99.9%',
                    apiCalls: 15234, // Mock data
                    avgResponseTime: '120ms' // Mock data
                }
            }
        });

    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find()
            .select('-password -verifyOtp -resetOtp -twoFactorSecret -backupCodes')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users: users
        });

    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
    try {
        const { targetUserId, newRole } = req.body;

        if (!targetUserId || !newRole) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID and new role are required" 
            });
        }

        const validRoles = ['user', 'moderator', 'admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid role. Must be user, moderator, or admin" 
            });
        }

        const user = await userModel.findByIdAndUpdate(
            targetUserId,
            { role: newRole },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: `User role updated to ${newRole}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}