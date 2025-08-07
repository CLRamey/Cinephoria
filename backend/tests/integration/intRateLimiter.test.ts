import request from 'supertest';
import express from 'express';
import { rateLimiter, loginRateLimiter } from '../../src/middlewares/rateLimiter';

const app = express();
app.use(rateLimiter);
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('rateLimiter middleware', () => {
  it('should enforce loginRateLimiter with login-specific message', async () => {
    app.use(loginRateLimiter);
    app.get('/login-client', (req, res) => {
      res.status(200).send('Login OK');
    });

    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/login-client');
      expect(res.status).toBe(200);
    }
    // 6th request should hit the login rate limit
    const res = await request(app).get('/login-client');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      message: 'Too many login attempts, please try again later.',
    });
  });

  // Test for rateLimiter (deducted the number of login requests to avoid conflict)
  it('should enforce rateLimiter with custom message', async () => {
    app.use(rateLimiter);
    app.get('/', (req, res) => {
      res.status(200).send('OK');
    });

    for (let i = 0; i < 4; i++) {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    }
    // 11th request should hit the rate limit
    const res = await request(app).get('/');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  });
});
