import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export const app = express();

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);
app.use(cookieParser(process.env['COOKIE_SECRET']));

// Parse JSON and URL-encoded data + limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Test route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Internal server error' });
});

// Import routes
