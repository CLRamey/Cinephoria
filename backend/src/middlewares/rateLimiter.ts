import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

// Rate limiter middleware to limit the number of requests
export const rateLimiter: import('express').RequestHandler = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 requests per windowMs
      message: 'Too many requests, please try again later.',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
        });
      },
    })
  : (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
// In development, skip rate limiting

// Rate limiter specifically for login attempts
export const loginRateLimiter: import('express').RequestHandler = isProduction
  ? rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 3,
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many login attempts, please try again later.',
        });
      },
    })
  : (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
// In development, skip rate limiting

// Reservation rate limiter for making actual reservations
export const reservationRateLimiter: import('express').RequestHandler = isProduction
  ? rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 2, // Limit each IP to 2 reservation requests per windowMs
      message: 'Too many reservation requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many reservation requests, please try again later.',
        });
      },
    })
  : (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
// In development, skip rate limiting

// General rate limiter for all routes
export const generalRateLimiter: import('express').RequestHandler = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
        });
      },
    })
  : (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
// In development, skip rate limiting
