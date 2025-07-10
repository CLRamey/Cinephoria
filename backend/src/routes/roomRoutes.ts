import { Router } from 'express';
import {
  publicRoomInfoController,
  publicRoomInfoByIdController,
} from '../controllers/roomInfoController';

const router = Router();

router.get('/rooms', publicRoomInfoController);
router.get('/rooms/:roomId', publicRoomInfoByIdController);

export default router;
// This code defines a route for fetching room information.
