import express from 'express';
import { generalRateLimiter, loginRateLimiter } from '../middlewares/rateLimiter';
import { loginEmployeeController } from '../controllers/loginEmployeeController';
import {
  listIncidentsController,
  createIncidentController,
  modifyIncidentController,
  deleteIncidentController,
} from '../controllers/employeeController';
import { employeeAuthMiddleware } from '../middlewares/authMiddleware';

// Routes for employees
const router = express.Router();

router.post('/login-employee', loginRateLimiter, loginEmployeeController);

// CRUD RESTful operations for cinema incident management
router.get(
  '/employee/incidents/:cinemaId/:roomId',
  employeeAuthMiddleware,
  generalRateLimiter,
  listIncidentsController,
);
router.post(
  '/employee/incidents/:cinemaId/:roomId',
  employeeAuthMiddleware,
  generalRateLimiter,
  createIncidentController,
);
router.put(
  '/employee/incidents/:incidentId',
  employeeAuthMiddleware,
  generalRateLimiter,
  modifyIncidentController,
);
router.delete(
  '/employee/incidents/:incidentId',
  employeeAuthMiddleware,
  generalRateLimiter,
  deleteIncidentController,
);

export default router;
