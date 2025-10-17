import express from 'express';
import { staffAuthMiddleware } from '../middlewares/authMiddleware';
import { generalRateLimiter } from '../middlewares/rateLimiter';
import * as crudController from '../controllers/crudController';

// Routes for staff-related operations
const router = express.Router();

// CRUD RESTful operations
// Apply middleware to all routes
router.use(staffAuthMiddleware, generalRateLimiter);

// Films
router
  .route('/staff/films')
  .get(crudController.listFilmsController)
  .post(crudController.createFilmController);

router
  .route('/staff/films/:filmId')
  .put(crudController.modifyFilmController)
  .delete(crudController.deleteFilmController);

// Rooms
router.route('/staff/rooms/:cinemaId').get(crudController.listRoomsController);

router.route('/staff/rooms').post(crudController.createRoomController);

router
  .route('/staff/rooms/:roomId')
  .put(crudController.modifyRoomController)
  .delete(crudController.deleteRoomController);

// Screenings
router
  .route('/staff/screenings/:cinemaId/:roomId/:filmId')
  .get(crudController.listScreeningsController);

router.route('/staff/screenings').post(crudController.createScreeningController);

router
  .route('/staff/screenings/:screeningId')
  .put(crudController.modifyScreeningController)
  .delete(crudController.deleteScreeningController);

export default router;
