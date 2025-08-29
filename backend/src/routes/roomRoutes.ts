import { Router } from 'express';
import {
  publicRoomInfoController,
  publicRoomInfoByIdController,
} from '../controllers/roomInfoController';
import { generalRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/rooms', generalRateLimiter, publicRoomInfoController);
router.get('/rooms/:roomId', generalRateLimiter, publicRoomInfoByIdController);

export default router;
// This code defines a route for fetching room information.
