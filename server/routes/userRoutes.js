import express from "express";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import {
  getUserData,
  getUserDashboard,
  getModeratorDashboard,
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
} from "../controllers/userController.js";

const userRouter = express.Router();

/**
 * @swagger
 * /api/user/data:
 *   get:
 *     summary: Get authenticated user data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isAccountVerified:
 *                       type: boolean
 *                     twoFactorEnabled:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/data", userAuth, getUserData);

/**
 * @swagger
 * /api/user/dashboard/user:
 *   get:
 *     summary: Get user dashboard data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard data
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/dashboard/user", userAuth, getUserDashboard);

/**
 * @swagger
 * /api/user/dashboard/moderator:
 *   get:
 *     summary: Get moderator dashboard data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Moderator dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires moderator or admin role
 */
userRouter.get(
  "/dashboard/moderator",
  userAuth,
  roleAuth(["admin", "moderator"]),
  getModeratorDashboard
);

/**
 * @swagger
 * /api/user/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires admin role
 */
userRouter.get(
  "/dashboard/admin",
  userAuth,
  roleAuth("admin"),
  getAdminDashboard
);

/**
 * @swagger
 * /api/user/all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
userRouter.get("/all-users", userAuth, roleAuth("admin"), getAllUsers);

/**
 * @swagger
 * /api/user/update-role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
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
 *               - newRole
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6922bec1951a1839a8ac9687
 *               newRole:
 *                 type: string
 *                 enum: [user, moderator, admin]
 *                 example: moderator
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role or user not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
userRouter.put("/update-role", userAuth, roleAuth("admin"), updateUserRole);

/**
 * @swagger
 * /api/user/admin-data:
 *   get:
 *     summary: Admin data access (Legacy endpoint)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 *       403:
 *         description: Forbidden
 */
userRouter.get("/admin-data", userAuth, roleAuth("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin data access granted",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/user/moderator-data:
 *   get:
 *     summary: Moderator data access (Legacy endpoint)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Moderator access granted
 *       403:
 *         description: Forbidden
 */
userRouter.get(
  "/moderator-data",
  userAuth,
  roleAuth(["admin", "moderator"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Moderator data access granted",
      userRole: req.body.role,
      timestamp: new Date().toISOString(),
    });
  }
);

export default userRouter;
