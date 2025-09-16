import express, { Response, Request } from 'express';
import { logoutHandler } from '../../src/controllers/logoutController';
import sharedRoutes from '../../src/routes/sharedRoutes';
import cookieParser from 'cookie-parser';
import { clearAccessToken } from '../../src/utils/tokenManagement';
import * as logger from '../../src/utils/logger';

process.env.NODE_ENV = 'test';
process.env.COOKIE_SECRET = 'testsecret';

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/api/logout', sharedRoutes);

jest.mock('../../src/middlewares/authMiddleware', () => ({
  generalAuthMiddleware: jest.fn(),
}));
jest.mock('../../src/utils/tokenManagement', () => ({
  clearAccessToken: jest.fn(),
}));
jest.mock('../../src/models/init-models');
jest.mock('../../src/utils/logger');

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

describe('logoutHandler', () => {
  let req: Partial<Request>;
  let res: Response;

  beforeEach(() => {
    req = {
      cookies: {},
      signedCookies: {},
    } as unknown as Request;
    res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    jest.clearAllMocks();
  });

  it('should clear access token and return success', async () => {
    (clearAccessToken as jest.Mock).mockImplementation(resArg => {
      resArg.clearCookie?.('access_token');
    });
    const result = await logoutHandler(req as Request, res as Response);
    expect(clearAccessToken).toHaveBeenCalledWith(res);
    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
    expect(result).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('should handle errors and return LOGOUT_ERROR', async () => {
    const fakeError = new Error('fail');
    (clearAccessToken as jest.Mock).mockImplementation(() => {
      throw fakeError;
    });
    const result = await logoutHandler(req as Request, res as Response);
    expect(clearAccessToken).toHaveBeenCalledWith(res);
    expect(logger.logerror).toHaveBeenCalledWith('Logout error:', fakeError);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'An error occurred during logout',
        code: 'LOGOUT_ERROR',
      },
    });
  });
});
