import express from 'express';
import { loginRateLimiter } from '../middlewares/rateLimiter';
import { loginAdminController } from '../controllers/loginAdminController';

const router = express.Router();

router.post('/login-admin', loginRateLimiter, loginAdminController);

export default router;
