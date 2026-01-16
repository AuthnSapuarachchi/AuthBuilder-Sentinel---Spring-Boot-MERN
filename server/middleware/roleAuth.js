
const roleAuth = (roles = []) => {
    // roles param can be a single role string (e.g., 'admin') or an array of roles
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        const userRole = req.body.role || req.user?.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};

export default roleAuth;
