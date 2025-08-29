process.env.NODE_ENV = 'production';

import request from 'supertest';
import express from 'express';
import {
  rateLimiter,
  loginRateLimiter,
  reservationRateLimiter,
  generalRateLimiter,
} from '../../src/middlewares/rateLimiter';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
  process.env.NODE_ENV = 'test';
});

// Rate Limiter tests
describe('reservationRateLimiter middleware', () => {
  it('should enforce reservationRateLimiter with custom message', async () => {
    const app = express();
    app.use(reservationRateLimiter);
    app.get('/reserve', (req, res) => {
      res.status(200).send('OK');
    });
    for (let i = 0; i < 2; i++) {
      const res = await request(app).get('/reserve');
      expect(res.status).toBe(200);
    }
    const res = await request(app).get('/reserve');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      message: 'Too many reservation requests, please try again later.',
    });
  });
});

describe('loginRateLimiter middleware', () => {
  it('should enforce loginRateLimiter with login-specific message', async () => {
    const app = express();
    app.use(loginRateLimiter);
    app.get('/login-client', (req, res) => {
      res.status(200).send('Login OK');
    });
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/login-client');
      expect(res.status).toBe(200);
    }
    const res = await request(app).get('/login-client');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      message: 'Too many login attempts, please try again later.',
    });
  });
});

describe('rateLimiter middleware', () => {
  it('should enforce rateLimiter with custom message', async () => {
    const app = express();
    app.use(rateLimiter);
    app.get('/register-client', (req, res) => {
      res.status(200).send('OK');
    });
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/register-client');
      expect(res.status).toBe(200);
    }
    const res = await request(app).get('/register-client');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  });
});

describe('generalRateLimiter middleware', () => {
  it('should enforce generalRateLimiter with custom message', async () => {
    const app = express();
    app.use(generalRateLimiter);
    app.get('/general-test', (req, res) => {
      res.status(200).send('OK');
    });
    for (let i = 0; i < 100; i++) {
      const res = await request(app).get('/general-test');
      expect(res.status).toBe(200);
    }
    const res = await request(app).get('/general-test');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  });
});
