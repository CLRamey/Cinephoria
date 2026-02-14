import request from 'supertest';
import express from 'express';
import clientRoutes from '../../src/routes/clientRoutes';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';
import { Response, NextFunction } from 'express';
import { Role } from '../../src/validators/userValidator';

const app = express();
app.use(express.json());
jest.mock('../../src/middlewares/authMiddleware', () => ({
  clientAuthMiddleware: [
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      req.user = {
        userId: 1,
        userRole: Role.CLIENT,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      next();
    },
  ],
}));
app.use('/api', clientRoutes);

jest.mock('../../src/utils/sanitize');
jest.mock('../../src/validators/userValidator');
jest.mock('../../src/models/init-models', () => ({
  user: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe('GET /api/client/profile integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should return success when fetching client profile succeeds', async () => {
    const response = await request(app).get('/api/client');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        userId: 1,
        userRole: 'client',
      },
    });
  });
});
