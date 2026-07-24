export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        errors: err.errors || null,
    });
}
export { authenticate } from './auth.middleware.js';
export { authorize } from './role.middleware.js';
