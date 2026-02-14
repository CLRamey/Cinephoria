import express from 'express';
import { staffAuthMiddleware } from '../middlewares/authMiddleware';
import { generalRateLimiter } from '../middlewares/rateLimiter';
import {
  listFilmsController,
  createFilmController,
  modifyFilmController,
  deleteFilmController,
  listRoomsController,
  createRoomController,
  modifyRoomController,
  deleteRoomController,
  listScreeningsController,
  createScreeningController,
  modifyScreeningController,
  deleteScreeningController,
} from '../controllers/crudController';

// Routes for staff-related operations
const router = express.Router();

// CRUD RESTful operations for staff and film management
router.get('/staff/films', staffAuthMiddleware, generalRateLimiter, listFilmsController);
router.post('/staff/films', staffAuthMiddleware, generalRateLimiter, createFilmController);
router.put('/staff/films/:filmId', staffAuthMiddleware, generalRateLimiter, modifyFilmController);
router.delete(
  '/staff/films/:filmId',
  staffAuthMiddleware,
  generalRateLimiter,
  deleteFilmController,
);

// CRUD RESTful operations for staff and room management
router.get('/staff/rooms/:cinemaId', staffAuthMiddleware, generalRateLimiter, listRoomsController);
router.post('/staff/rooms', staffAuthMiddleware, generalRateLimiter, createRoomController);
router.put('/staff/rooms/:roomId', staffAuthMiddleware, generalRateLimiter, modifyRoomController);
router.delete(
  '/staff/rooms/:roomId',
  staffAuthMiddleware,
  generalRateLimiter,
  deleteRoomController,
);

// CRUD RESTful operations for staff and screening management
router.get(
  '/staff/screenings/:cinemaId/:roomId/:filmId',
  staffAuthMiddleware,
  generalRateLimiter,
  listScreeningsController,
);
router.post(
  '/staff/screenings',
  staffAuthMiddleware,
  generalRateLimiter,
  createScreeningController,
);
router.put(
  '/staff/screenings/:screeningId',
  staffAuthMiddleware,
  generalRateLimiter,
  modifyScreeningController,
);
router.delete(
  '/staff/screenings/:screeningId',
  staffAuthMiddleware,
  generalRateLimiter,
  deleteScreeningController,
);

export default router;
