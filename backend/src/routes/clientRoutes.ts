import express from 'express';
import {
  registerUserController,
  verifyEmailController,
} from '../controllers/registerUserController';
import { loginClientController } from '../controllers/loginClientController';
import { clientAuthMiddleware } from '../middlewares/authMiddleware';
import { clientProfileController } from '../controllers/clientController';
import { rateLimiter, loginRateLimiter, generalRateLimiter } from '../middlewares/rateLimiter';

// Routes for the client
const router = express.Router();

router.post('/register-client', rateLimiter, registerUserController);
router.post('/verify-email', rateLimiter, verifyEmailController);
router.post('/login-client', loginRateLimiter, loginClientController);

// Protected client routes
router.get('/client', clientAuthMiddleware, generalRateLimiter, clientProfileController);

export default router;
