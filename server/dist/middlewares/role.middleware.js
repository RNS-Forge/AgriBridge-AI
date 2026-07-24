export function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Authentication is required.',
            });
        }
        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. You do not have permission to access this resource. Allowed roles: ${allowedRoles.join(', ')}`,
            });
        }
        next();
    };
}
