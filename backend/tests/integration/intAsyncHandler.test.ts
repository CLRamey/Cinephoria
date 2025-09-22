import request from 'supertest';
import express from 'express';
import { asyncHandler } from '../../src/middlewares/asyncHandler';

const app = express();
app.get(
  '/success',
  asyncHandler(async () => ({ success: true, data: { here: 'now' } })),
);
app.get(
  '/error',
  asyncHandler(async () => ({ success: false, error: { code: 'ERROR', message: 'oops' } })),
);
app.get(
  '/throw',
  asyncHandler(async () => {
    throw new Error('boom');
  }),
);

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe('asyncHandler Integration Tests', () => {
  it('returns 200 for successful handler', async () => {
    const res = await request(app).get('/success');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { here: 'now' } });
  });

  it('returns 500 for error handler in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: { message: undefined, code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('returns 500 for thrown errors in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app).get('/throw');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: { message: undefined, code: 'INTERNAL_SERVER_ERROR' },
    });
  });
});
