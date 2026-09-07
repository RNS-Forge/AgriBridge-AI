export function authorize(allowedRoles) {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Authentication is required.',
            });
        }
        // Admin Override: SuperAdmin can bypass any role check
        const isSuperAdmin = authReq.user.roles.includes('SuperAdmin');
        if (isSuperAdmin) {
            return next();
        }
        const hasRole = authReq.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. You do not have permission to access this resource. Allowed roles: ${allowedRoles.join(', ')}`,
            });
        }
        next();
    };
}
