import express from 'express';
import {
  seatingController,
  reservingController,
  reservationsController,
} from '../controllers/reservationController';
import { clientAuthMiddleware } from '../middlewares/authMiddleware';
import { reservationRateLimiter, generalRateLimiter } from '../middlewares/rateLimiter';

// Routes for reservations
const router = express.Router();

router.get('/screenings/:id/seats', generalRateLimiter, seatingController);
router.post('/reserve', clientAuthMiddleware, reservationRateLimiter, reservingController);
router.get(
  '/client-reservations',
  clientAuthMiddleware,
  generalRateLimiter,
  reservationsController,
);

export default router;
