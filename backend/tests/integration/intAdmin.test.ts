import request from 'supertest';
import express from 'express';
import adminRoutes from '../../src/routes/adminRoutes';
import { registerEmployee, resetPassword } from '../../src/services/registerUserService';
import { getReservationStats, listEmployees } from '../../src/services/adminService';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';
import { Response, NextFunction } from 'express';
import { Role } from '../../src/validators/userValidator';
import {
  adminReservationsHandler,
  createEmployeeAccountHandler,
  modifyEmployeePasswordHandler,
  listEmployeeAccountsHandler,
} from '../../src/controllers/adminController';

const app = express();
app.use(express.json());
// Mock admin authentication middleware
jest.mock('../../src/middlewares/authMiddleware', () => ({
  adminAuthMiddleware: [
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      req.user = {
        userId: 1,
        userRole: Role.ADMIN,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      next();
    },
  ],
}));
app.use('/api', adminRoutes);

jest.mock('../../src/services/registerUserService');
jest.mock('../../src/services/adminService');
jest.mock('../../src/utils/sanitize');
jest.mock('../../src/validators/userValidator');
jest.mock('../../src/models/init-models', () => ({
  user: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe('GET /api/reservation-stats integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockAdminReq = (userRole = Role.ADMIN) => ({
    user: { userId: 1, userRole },
  });

  it('should return success when fetching reservation stats succeeds', async () => {
    (getReservationStats as jest.Mock).mockResolvedValue({
      success: true,
      data: { totalReservations: 100, activeReservations: 80 },
    });
    const result = await adminReservationsHandler(
      mockAdminReq() as unknown as AuthenticatedRequest,
    );
    expect(getReservationStats).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: { totalReservations: 100, activeReservations: 80 },
    });
  });

  it('should return false for unsuccessful fetch of reservation stats', async () => {
    (getReservationStats as jest.Mock).mockResolvedValue({
      success: false,
    });
    const result = await adminReservationsHandler(
      mockAdminReq() as unknown as AuthenticatedRequest,
    );
    expect(getReservationStats).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
    });
  });
});

describe('GET /api/employees integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockListReq = (userRole = Role.ADMIN) => ({
    user: { userId: 1, userRole },
  });
  it('should return success when listing employees succeeds', async () => {
    (listEmployees as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ userId: 1, userEmail: 'alice@example.com' }],
    });
    const result = await listEmployeeAccountsHandler(
      mockListReq() as unknown as AuthenticatedRequest,
    );
    expect(listEmployees).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: [{ userId: 1, userEmail: 'alice@example.com' }],
    });
  });

  it('should return false for unsuccessful listing of employees', async () => {
    (listEmployees as jest.Mock).mockResolvedValue({
      success: false,
    });
    const result = await listEmployeeAccountsHandler(
      mockListReq() as unknown as AuthenticatedRequest,
    );
    expect(listEmployees).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
    });
  });
});

const mockEmployeeInput = {
  employeeData: {
    userFirstName: 'Alice',
    userLastName: 'Smith',
    userUsername: 'alicesmith',
    userEmail: 'alice@example.com',
    userPassword: 'StrongPassword123!',
    userRole: 'employee',
    agreedPolicy: true,
    agreedCgvCgu: true,
  },
};

describe('POST /api/employee integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockReq = (userRole = Role.ADMIN, body = mockEmployeeInput) => ({
    user: { userId: 1, userRole },
    body,
  });

  it('should return success when employee registration succeeds', async () => {
    (registerEmployee as jest.Mock).mockResolvedValue({
      success: true,
      data: { userId: 1, userEmail: 'alice@example.com' },
    });
    const result = await createEmployeeAccountHandler(mockReq() as unknown as AuthenticatedRequest);
    expect(registerEmployee).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: { message: 'Employee registration successful.' },
    });
  });

  it('should respond 200 and confirm employee registration success', async () => {
    (registerEmployee as jest.Mock).mockResolvedValue({
      success: true,
      data: { userId: 1, userEmail: 'alice@example.com' },
    });
    const response = await request(app).post('/api/employee').send(mockEmployeeInput);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBe('Employee registration successful.');
  });

  it('should respond 400 if employee required fields are missing', async () => {
    const response = await request(app)
      .post('/api/employee')
      .send({
        ...mockEmployeeInput,
        employeeData: { userFirstName: '' },
      });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Missing employee attribute');
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('should respond 500 if register employee returns failure', async () => {
    (registerEmployee as jest.Mock).mockRejectedValue(new Error('Employee registration failed'));
    const response = await request(app).post('/api/employee').send(mockEmployeeInput);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('An error occurred during employee registration');
  });
});

const mockResetInput = {
  resetData: {
    userId: 1,
    newPassword: 'NewPassword123!',
  },
};

describe('PUT /api/employee/password integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockResetReq = (userRole = Role.ADMIN, body = mockResetInput) => ({
    user: { userId: 1, userRole },
    body,
  });

  it('should return success when employee password reset succeeds', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({
      success: true,
      data: { userId: 1 },
    });
    const result = await modifyEmployeePasswordHandler(
      mockResetReq() as unknown as AuthenticatedRequest,
    );
    expect(resetPassword).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: { message: 'Employee password reset successfully.' },
    });
  });

  it('should respond 200 and confirm password reset success', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({
      success: true,
      data: { userId: 1 },
    });
    const response = await request(app).put('/api/employee/password').send(mockResetInput);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBe('Employee password reset successfully.');
  });

  it('should respond 400 if password reset required fields are missing', async () => {
    const response = await request(app).put('/api/employee/password').send({ userId: 1 });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Missing required fields');
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('should respond 500 if reset password returns failure', async () => {
    (resetPassword as jest.Mock).mockRejectedValue(new Error('Employee password reset failed'));
    const response = await request(app).put('/api/employee/password').send(mockResetInput);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Internal server error');
  });
});
