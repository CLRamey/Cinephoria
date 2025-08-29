import { Router } from 'express';
import { publicGenreInfoController } from '../controllers/genreInfoController';
import { generalRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/genre', generalRateLimiter, publicGenreInfoController);

export default router;
// This code defines a route for fetching genre information.
