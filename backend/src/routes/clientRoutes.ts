import express from 'express';
import {
  registerUserController,
  verifyEmailController,
} from '../controllers/registerUserController';

const router = express.Router();

router.post('/register-client', registerUserController);
router.get('/verify-email', verifyEmailController);

export default router;
