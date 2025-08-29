import { Router } from 'express';
import {
  publicFilmInfoByIdController,
  publicFilmInfoController,
} from '../controllers/filmInfoController';
import { generalRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/film', generalRateLimiter, publicFilmInfoController);
router.get('/film/:filmId', generalRateLimiter, publicFilmInfoByIdController);

export default router;
// This code defines a route for fetching film information.
