import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required. Authorization format should be Bearer <token>',
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid access token',
        });
    }
}
