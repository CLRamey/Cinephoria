import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, VerificationTokenPayload } from '../utils/tokenManagement';
import { Role } from '../validators/userValidator';
import { user } from '../models/init-models';
import { logerror } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: VerificationTokenPayload;
}

// Middleware method to authenticate the user based on JWT token
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  let token = req.signedCookies?.['access_token'];
  if (!token) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or malformed token' });
      return;
    }
    token = authHeader.slice(7); // skip "Bearer "
  }
  try {
    const payload: VerificationTokenPayload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    logerror('JWT error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware method to restrict access based on user roles
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.userRole as Role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

// Middleware method to check if the user is verified
export const checkUserVerified = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const currentUser = await user.findByPk(req.user.userId, {
      attributes: ['isVerified'],
    });
    const isVerified = currentUser?.get('isVerified') === true;
    if (!currentUser || !isVerified) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }
    next();
  } catch (error) {
    logerror('DB error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Combined middleware factory for authenticated and authorized access
export const authMiddleware = (...allowedRoles: Role[]) => {
  return [authenticate, authorize(...allowedRoles), checkUserVerified];
};

// Client specific middleware that ensures the user is authenticated, authorized (secure check that they are a CLIENT) and verified.
export const clientAuthMiddleware: RequestHandler[] = authMiddleware(
  Role.CLIENT,
) as RequestHandler[];

// Employee specific middleware that ensures the user is authenticated, authorized (secure check that they are an EMPLOYEE) and verified.
export const employeeAuthMiddleware: RequestHandler[] = authMiddleware(
  Role.EMPLOYEE,
) as RequestHandler[];

// Admin specific middleware that ensures the user is authenticated, authorized (secure check that they are an ADMIN) and verified.
export const adminAuthMiddleware: RequestHandler[] = authMiddleware(Role.ADMIN) as RequestHandler[];

// General middleware that ensures the user is authenticated, authorized (secure check that they are either a CLIENT, EMPLOYEE or ADMIN) and verified.
export const generalAuthMiddleware: RequestHandler[] = authMiddleware(
  Role.CLIENT,
  Role.EMPLOYEE,
  Role.ADMIN,
) as RequestHandler[];
