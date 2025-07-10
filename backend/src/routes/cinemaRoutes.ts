// src/routes/cinemaInfoRoutes.ts
import { Router } from 'express';
import { publicCinemaInfoController } from '../controllers/cinemaInfoController';

const router = Router();

router.get('/cinema', publicCinemaInfoController);

export default router;
// This code defines a route for fetching cinema information.
