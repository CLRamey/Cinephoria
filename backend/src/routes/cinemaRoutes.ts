// src/routes/cinemaInfoRoutes.ts
import { Router } from 'express';
import { publicCinemaInfoController } from '../controllers/cinemaInfoController';
import { generalRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/cinema', generalRateLimiter, publicCinemaInfoController);

export default router;
// This code defines a route for fetching cinema information.
