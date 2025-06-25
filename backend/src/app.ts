// File: backend/src/app.ts
// This file sets up the Express application with security, CORS, cookie parser and routes.
import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import routes
import cinemaRoutes from './routes/cinemaRoutes';

// Express
export const app = express();

// Helmet for security headers + Content Security Policy (CSP) to prevent XSS attacks
app.use(helmet());
app.use(
  contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'https:'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env['CORS_ORIGIN']].filter(Boolean) as string[], // Allow connections to the frontend
    },
  }),
);

// Enable CORS with specific origin and credentials
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Parse JSON and URL-encoded data + limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Parse cookies
app.use(cookieParser(process.env['COOKIE_SECRET']));

// Routes
app.use('/api', cinemaRoutes);

// Health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
});
