import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/tokenManagement';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed token' });
  }
  try {
    const token = authHeader.slice(7); // skip "Bearer "
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    console.error('JWT error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || typeof req.user.userRole !== 'string' || !roles.includes(req.user.userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

export const requireVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isVerified) {
    return res.status(403).json({ message: 'Account not verified' });
  }
  next();
};
