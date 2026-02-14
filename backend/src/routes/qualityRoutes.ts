import { Router } from 'express';
import {
  publicQualityInfoController,
  publicQualityInfoByIdController,
} from '../controllers/qualityInfoController';

const router = Router();

router.get('/quality', publicQualityInfoController);
router.get('/quality/:qualityId', publicQualityInfoByIdController);

export default router;
// This code defines a route for fetching quality information.
