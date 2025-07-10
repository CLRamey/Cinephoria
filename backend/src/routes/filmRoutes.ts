import { Router } from 'express';
import {
  publicFilmInfoByIdController,
  publicFilmInfoController,
} from '../controllers/filmInfoController';

const router = Router();

router.get('/film', publicFilmInfoController);
router.get('/film/:filmId', publicFilmInfoByIdController);

export default router;
// This code defines a route for fetching film information.
