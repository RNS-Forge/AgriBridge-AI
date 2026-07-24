import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/index.js';
import { AuthRequest, JwtPayload } from '../types/auth.types.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;
  const authHeader = authReq.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required. Authorization format should be Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    authReq.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid access token',
    });
  }
}
