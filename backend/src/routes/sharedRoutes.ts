import express from 'express';
import { logoutController } from '../controllers/logoutController';
import { generalRateLimiter } from '../middlewares/rateLimiter';
import { generalAuthMiddleware } from '../middlewares/authMiddleware';
import { cookieCheckController } from '../controllers/cookieController';

const router = express.Router();

router.get('/cookie-check', generalAuthMiddleware, generalRateLimiter, cookieCheckController);
router.post('/logout', generalAuthMiddleware, generalRateLimiter, logoutController);

export default router;
