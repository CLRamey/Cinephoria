import request from 'supertest';
import express from 'express';
import employeeRoutes from '../../src/routes/employeeRoutes';
import { user } from '../../src/models/init-models';
import { comparePasswords } from '../../src/utils/userPassword';
import { generateAccessToken, attachAccessToken } from '../../src/utils/tokenManagement';
import { validateLoginInput } from '../../src/validators/userValidator';
import { sanitizeLoginInput } from '../../src/utils/sanitize';
import cookieParser from 'cookie-parser';

process.env.NODE_ENV = 'test';
process.env.COOKIE_SECRET = 'testsecret';

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/api', employeeRoutes);

// Mock dependencies
jest.mock('../../src/models/init-models', () => ({
  user: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/utils/userPassword', () => ({
  comparePasswords: jest.fn(),
}));

jest.mock('../../src/utils/tokenManagement', () => ({
  generateAccessToken: jest.fn(),
  attachAccessToken: jest.fn(),
}));

jest.mock('../../src/validators/userValidator', () => ({
  validateLoginInput: jest.fn(),
}));

jest.mock('../../src/utils/sanitize', () => ({
  sanitizeLoginInput: jest.fn(),
}));

jest.mock('../../src/middlewares/authMiddleware', () => ({
  adminAuthMiddleware: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Login-employee integration test', () => {
  it('should return success response with userRole on valid credentials', async () => {
    const body = {
      userEmail: 'employee@example.com',
      userPassword: 'Password123!',
    };
    const validUser = {
      get: (field: string) => {
        if (field === 'userId') return 1;
        if (field === 'userPassword') return 'hashed_password';
        if (field === 'userRole') return 'employee';
        if (field === 'isVerified') return true;
        return undefined;
      },
    };
    (sanitizeLoginInput as jest.Mock).mockReturnValue(body);
    (validateLoginInput as jest.Mock).mockResolvedValue(body);
    (user.findOne as jest.Mock).mockResolvedValue(validUser);
    (comparePasswords as jest.Mock).mockResolvedValue(true);
    (generateAccessToken as jest.Mock).mockReturnValue('fake_token');

    const response = await request(app).post('/api/login-employee').send(body);
    expect(generateAccessToken).toHaveBeenCalledWith(1, 'employee');
    expect(attachAccessToken).toHaveBeenCalledWith(expect.any(Object), 'fake_token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      userRole: 'employee',
    });
  });

  it('should return error if user is not found', async () => {
    const body = {
      userEmail: 'notfound@example.com',
      userPassword: 'Password123!',
    };
    (sanitizeLoginInput as jest.Mock).mockReturnValue(body);
    (validateLoginInput as jest.Mock).mockResolvedValue(body);
    (user.findOne as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post('/api/login-employee').send(body);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return error if password does not match', async () => {
    const body = {
      userEmail: 'test@example.com',
      userPassword: 'wrongPassword123!',
    };
    const validUser = {
      get: (field: string) => {
        if (field === 'userId') return 1;
        if (field === 'userPassword') return 'hashed_password';
        if (field === 'userRole') return 'employee';
        if (field === 'isVerified') return true;
        return undefined;
      },
    };
    (sanitizeLoginInput as jest.Mock).mockReturnValue(body);
    (validateLoginInput as jest.Mock).mockResolvedValue(body);
    (user.findOne as jest.Mock).mockResolvedValue(validUser);
    (comparePasswords as jest.Mock).mockResolvedValue(false);
    const res = await request(app).post('/api/login-employee').send(body);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return error if role is not employee', async () => {
    const body = {
      userEmail: 'admin@example.com',
      userPassword: 'Password123!',
    };
    const invalidRoleUser = {
      get: (field: string) => {
        if (field === 'userId') return 1;
        if (field === 'userPassword') return 'hashed_password';
        if (field === 'userRole') return 'client';
        if (field === 'isVerified') return true;
        return undefined;
      },
    };
    (sanitizeLoginInput as jest.Mock).mockReturnValue(body);
    (validateLoginInput as jest.Mock).mockResolvedValue(body);
    (user.findOne as jest.Mock).mockResolvedValue(invalidRoleUser);
    const res = await request(app).post('/api/login-employee').send(body);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return error if user is not verified', async () => {
    const body = {
      userEmail: 'unverified@example.com',
      userPassword: 'Password123!',
    };
    const unverifiedUser = {
      get: (field: string) => {
        if (field === 'userId') return 1;
        if (field === 'userPassword') return 'hashed_password';
        if (field === 'userRole') return 'employee';
        if (field === 'isVerified') return false;
        return undefined;
      },
    };
    (sanitizeLoginInput as jest.Mock).mockReturnValue(body);
    (validateLoginInput as jest.Mock).mockResolvedValue(body);
    (user.findOne as jest.Mock).mockResolvedValue(unverifiedUser);
    const res = await request(app).post('/api/login-employee').send(body);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
