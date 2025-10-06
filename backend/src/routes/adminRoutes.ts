import express from 'express';
import { loginRateLimiter } from '../middlewares/rateLimiter';
import { loginAdminController } from '../controllers/loginAdminController';
import { adminAuthMiddleware } from '../middlewares/authMiddleware';
import { adminReservationsController } from '../controllers/adminController';
import { generalRateLimiter } from '../middlewares/rateLimiter';

// Routes for admin
const router = express.Router();

router.post('/login-admin', loginRateLimiter, loginAdminController);
router.get(
  '/reservation-stats',
  adminAuthMiddleware,
  generalRateLimiter,
  adminReservationsController,
);

export default router;
