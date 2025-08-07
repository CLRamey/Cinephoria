import express from 'express';
import { loginRateLimiter } from '../middlewares/rateLimiter';
import { loginEmployeeController } from '../controllers/loginEmployeeController';

const router = express.Router();

router.post('/login-employee', loginRateLimiter, loginEmployeeController);

export default router;
