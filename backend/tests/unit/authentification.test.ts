import { Response, NextFunction } from 'express';
import {
  authenticate,
  authorize,
  checkUserVerified,
  AuthenticatedRequest,
} from '../../src/middlewares/authMiddleware';
import { verifyToken } from '../../src/utils/tokenManagement';
import { user } from '../../src/models/init-models';
import { Role } from '../../src/validators/userValidator';

jest.mock('../../src/utils/tokenManagement');
jest.mock('../../src/models/init-models');

describe('authMiddleware unit tests', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      user: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    it('should return 401 if Authorization header is missing', async () => {
      (req.header as jest.Mock).mockReturnValue(undefined);
      await authenticate(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing or malformed token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header does not start with Bearer', async () => {
      (req.header as jest.Mock).mockReturnValue('InvalidToken');
      await authenticate(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing or malformed token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should attach user payload and call next if token is valid', async () => {
      (req.header as jest.Mock).mockReturnValue('Bearer validtoken');
      (verifyToken as jest.Mock).mockReturnValue({ userId: 1, userRole: Role.CLIENT });
      await authenticate(req as AuthenticatedRequest, res as Response, next);
      expect(verifyToken).toHaveBeenCalledWith('validtoken');
      expect(req.user).toEqual({ userId: 1, userRole: Role.CLIENT });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      (req.header as jest.Mock).mockReturnValue('Bearer invalidtoken');
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      await authenticate(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    const runAuthorize = (allowedRoles: Role[], userRole?: Role) => {
      const middleware = authorize(...allowedRoles);
      req.user = userRole ? { userId: 1, userRole, iat: 0, exp: 0 } : undefined;
      return middleware(req as AuthenticatedRequest, res as Response, next!);
    };
    it('should return 403 if req.user is missing', () => {
      authorize(Role.CLIENT)(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not allowed', () => {
      req.user = { userId: 1, userRole: Role.ADMIN, iat: 0, exp: 0 }!;
      runAuthorize([Role.CLIENT], Role.ADMIN);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is allowed', () => {
      req.user = { userId: 1, userRole: Role.CLIENT, iat: 0, exp: 0 };
      runAuthorize([Role.CLIENT], Role.CLIENT);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('checkUserVerified middleware', () => {
    it('should return 401 if req.user is missing', async () => {
      req.user = undefined;
      await checkUserVerified(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user not found', async () => {
      req.user = { userId: 1, userRole: Role.CLIENT, iat: 0, exp: 0 };
      (user.findByPk as jest.Mock).mockResolvedValue(null);
      await checkUserVerified(req as AuthenticatedRequest, res as Response, next);
      expect(user.findByPk).toHaveBeenCalledWith(1, { attributes: ['isVerified'] });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not verified', async () => {
      req.user = { userId: 1, userRole: Role.CLIENT, iat: 0, exp: 0 };
      (user.findByPk as jest.Mock).mockResolvedValue({ get: jest.fn().mockResolvedValue(false) });
      await checkUserVerified(req as AuthenticatedRequest, res as Response, next);
      expect(user.findByPk).toHaveBeenCalledWith(1, { attributes: ['isVerified'] });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is verified', async () => {
      req.user = { userId: 1, userRole: Role.CLIENT, iat: 0, exp: 0 };
      (user.findByPk as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue(true) });
      await checkUserVerified(req as AuthenticatedRequest, res as Response, next);
      expect(user.findByPk).toHaveBeenCalledWith(1, { attributes: ['isVerified'] });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 500 if DB throws error', async () => {
      req.user = { userId: 1, userRole: Role.CLIENT, iat: 0, exp: 0 };
      (user.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));
      await checkUserVerified(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
