// File: backend/src/app.ts
// This file sets up the Express application with security, CORS, cookie parser and routes.
import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Express
export const app = express();

// Allowed origins for CORS
const corsOriginEnv = process.env.CORS_ORIGIN;
if (!corsOriginEnv) {
  throw new Error('CORS_ORIGIN is not defined');
}
const allowedOrigins: string[] = corsOriginEnv
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins, // Allow requests from the frontend
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Helmet for security headers + Content Security Policy (CSP) to prevent XSS attacks
app.use(helmet());
app.use(
  contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'https:'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...allowedOrigins], // Allow connections to the frontend
    },
  }),
);

// Parse JSON and URL-encoded data + limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Parse cookies
app.use(cookieParser(process.env['COOKIE_SECRET']));

// Import routes
import cinemaRoutes from './routes/cinemaRoutes';
import filmRoutes from './routes/filmRoutes';
import roomRoutes from './routes/roomRoutes';
import genreRoutes from './routes/genreRoutes';

// Register, login and protected routes
import clientRoutes from './routes/clientRoutes';
import employeeRoutes from './routes/employeeRoutes';
import adminRoutes from './routes/adminRoutes';

// Import reservation routes
import reservationRoutes from './routes/reservationRoutes';
import { generalRateLimiter } from './middlewares/rateLimiter';

// Routes
app.use('/api', cinemaRoutes);
app.use('/api', filmRoutes);
app.use('/api', roomRoutes);
app.use('/api', genreRoutes);

app.use('/api', clientRoutes);
app.use('/api', employeeRoutes);
app.use('/api', adminRoutes);

app.use('/api', reservationRoutes);

// Health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// General test rate limiter route
app.get('/api/general-test', generalRateLimiter, generalRateLimiter, (req, res) => {
  res.status(200).send('OK');
});

// 404 not found Error handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Not Found',
      code: 'NOT_FOUND',
    },
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({
    success: false,
    error: {
      message: 'An error has occurred. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
});
