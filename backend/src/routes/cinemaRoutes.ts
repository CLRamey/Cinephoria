// src/routes/cinemaInfoRoutes.ts
import { Router } from 'express';
import { cinemaInfoController } from '../controllers/cinemaInfoController';

const router = Router();

router.get('/cinema-info', cinemaInfoController);

export default router;
// This code defines a route for fetching cinema information.
