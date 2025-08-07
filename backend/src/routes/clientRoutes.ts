import express from 'express';
import {
  registerUserController,
  verifyEmailController,
} from '../controllers/registerUserController';
import { loginClientController } from '../controllers/loginClientController';
import { clientAuthMiddleware } from '../middlewares/authMiddleware';
import { clientProfileController } from '../controllers/clientController';
import { rateLimiter, loginRateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/register-client', rateLimiter, registerUserController);
router.post('/verify-email', rateLimiter, verifyEmailController);
router.post('/login-client', loginRateLimiter, loginClientController);

// Protected client routes
router.get('/client', clientAuthMiddleware, clientProfileController);

export default router;
