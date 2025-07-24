import request from 'supertest';
import express from 'express';
import clientRoutes from '../../src/routes/clientRoutes';
import { registerUser } from '../../src/services/registerUserService';
import { sendVerificationEmail } from '../../src/utils/verificationEmail';
import { user } from '../../src/models/init-models';

const app = express();
app.use(express.json());
app.use('/api', clientRoutes);

jest.mock('../../src/services/registerUserService');
jest.mock('../../src/utils/verificationEmail');
jest.mock('../../src/models/init-models', () => ({
  user: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

const mockUserInput = {
  userFirstName: 'Alice',
  userLastName: 'Smith',
  userUsername: 'alicesmith',
  userEmail: 'alice@example.com',
  userPassword: 'StrongPassword123!',
  userRole: 'client',
  agreedPolicy: true,
  agreedCgvCgu: true,
};

const mockRegisteredUser = {
  userRole: 'client',
  isVerified: false,
  userEmail: 'alice@example.com',
  userFirstName: 'Alice',
  verificationCode: 'abc123',
};

describe('POST /api/register-client integration test', () => {
  it('should respond 200 and confirm registration success', async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRegisteredUser,
    });
    (sendVerificationEmail as jest.Mock).mockResolvedValue(true);
    const response = await request(app).post('/api/register-client').send(mockUserInput);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBe('Registration success.');
  });

  it('should respond 400 if required fields are missing', async () => {
    const response = await request(app).post('/api/register-client').send({});
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('All fields are required');
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('should respond 500 if registerUser returns failure', async () => {
    (registerUser as jest.Mock).mockRejectedValue(new Error('Registration failed'));
    const response = await request(app).post('/api/register-client').send(mockUserInput);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('An error occurred during registration');
  });
});

describe('GET /api/verify-email integration test', () => {
  const mockUserInstance = {
    isVerified: false,
    verificationCode: 'abc123',
    verificationCodeExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in future
    save: jest.fn().mockResolvedValue(true),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should respond 200 and confirm email verification', async () => {
    (user.findOne as jest.Mock).mockResolvedValue(mockUserInstance);
    const response = await request(app).get('/api/verify-email?code=abc123');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBe('Email verified successfully');
    expect(mockUserInstance.isVerified).toBe(true);
    expect(mockUserInstance.verificationCode).toBeUndefined();
    expect(mockUserInstance.verificationCodeExpires).toBeUndefined();
    expect(mockUserInstance.save).toHaveBeenCalled();
  });

  it('should respond 400 if there is not a verification code', async () => {
    const response = await request(app).get('/api/verify-email');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Invalid verification code');
    expect(response.body.error.code).toBe('CODE_BAD_REQUEST');
  });

  it('should respond 404 if user not found or already verified', async () => {
    (user.findOne as jest.Mock).mockResolvedValue(null);
    const response = await request(app).get('/api/verify-email?code=wrongcode');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('User not found or already verified');
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('should respond 410 if verification code expired', async () => {
    (user.findOne as jest.Mock).mockResolvedValue({
      ...mockUserInstance,
      verificationCodeExpires: new Date(Date.now() - 1000),
    });
    const response = await request(app).get('/api/verify-email?code=abc123');
    expect(response.status).toBe(410);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Verification code has expired');
    expect(response.body.error.code).toBe('CODE_EXPIRED');
  });

  it('should respond 500 if verification fails due to internal error', async () => {
    (user.findOne as jest.Mock).mockRejectedValue(new Error('DB failure'));
    const response = await request(app).get('/api/verify-email?code=abc123');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('An error occurred during email verification');
    expect(response.body.error.code).toBe('VERIFICATION_ERROR');
  });
});
