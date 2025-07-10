import { Router } from 'express';
import { publicGenreInfoController } from '../controllers/genreInfoController';

const router = Router();

router.get('/genre', publicGenreInfoController);

export default router;
// This code defines a route for fetching genre information.
