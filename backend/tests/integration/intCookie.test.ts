import { cookieCheckHandler } from '../../src/controllers/cookieController';
import { verifyToken } from '../../src/utils/tokenManagement';
import { user } from '../../src/models/init-models';
import { Role } from '../../src/validators/userValidator';
import { Request } from 'express';
import express from 'express';
import sharedRoutes from '../../src/routes/sharedRoutes';
import cookieParser from 'cookie-parser';

process.env.NODE_ENV = 'test';
process.env.COOKIE_SECRET = 'testsecret';

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/api/cookie-check', sharedRoutes);

jest.mock('../../src/utils/tokenManagement');
jest.mock('../../src/models/init-models');
jest.mock('../../src/utils/logger');

describe('Cookie Check Test', () => {
  let mockReq: Request;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      signedCookies: {},
    } as unknown as Request;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should return UNAUTHORIZED if cookie is missing', async () => {
    const result = await cookieCheckHandler(mockReq as Request);
    expect(result).toEqual({ success: false, error: { code: 'UNAUTHORIZED' } });
  });

  it('should return UNAUTHORIZED if verifyToken error', async () => {
    if (!mockReq.signedCookies) mockReq.signedCookies = {};
    mockReq.signedCookies['access_token'] = 'badtoken';
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });
    const result = await cookieCheckHandler(mockReq);
    expect(result).toEqual({ success: false, error: { code: 'UNAUTHORIZED' } });
  });

  it('should return UNAUTHORIZED if user not found', async () => {
    const mockReq = {
      cookies: {},
      signedCookies: {},
    } as unknown as Request;
    mockReq.signedCookies['access_token'] = 'goodtoken';
    (verifyToken as jest.Mock).mockReturnValue({ userId: 1 });
    (user.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await cookieCheckHandler(mockReq);
    expect(result).toEqual({ success: false, error: { code: 'UNAUTHORIZED' } });
    expect(user.findByPk).toHaveBeenCalledWith(1, {
      attributes: ['user_role', 'isVerified'],
    });
  });

  it('should return UNAUTHORIZED if user not verified', async () => {
    if (!mockReq.signedCookies) mockReq.signedCookies = {};
    mockReq.signedCookies['access_token'] = 'goodtoken';
    (verifyToken as jest.Mock).mockReturnValue({ userId: 1 });
    (user.findByPk as jest.Mock).mockResolvedValue({
      get: jest
        .fn()
        .mockImplementation((attr: string) => (attr === 'isVerified' ? false : 'client')),
    });

    const result = await cookieCheckHandler(mockReq);
    expect(result).toEqual({ success: false, error: { code: 'UNAUTHORIZED' } });
  });

  it.each([
    ['admin', Role.ADMIN],
    ['employee', Role.EMPLOYEE],
    ['client', Role.CLIENT],
  ])('should return user role %s if verified', async (dbRole, expectedRole) => {
    if (!mockReq.signedCookies) mockReq.signedCookies = {};
    mockReq.signedCookies['access_token'] = 'goodtoken';
    (verifyToken as jest.Mock).mockReturnValue({ userId: 1 });
    (user.findByPk as jest.Mock).mockResolvedValue({
      get: jest.fn().mockImplementation((attr: string) => (attr === 'isVerified' ? true : dbRole)),
    });
    const result = await cookieCheckHandler(mockReq);
    expect(result).toEqual({
      success: true,
      data: { userRole: expectedRole },
    });
  });
});
