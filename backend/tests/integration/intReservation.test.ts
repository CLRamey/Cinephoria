import request from 'supertest';
import express, { Request } from 'express';
import reservationRoutes from '../../src/routes/reservationRoutes';
import * as reservationService from '../../src/services/reservationService';
import { ReservationService } from '../../src/services/reservationService';
import { Role } from '../../src/validators/userValidator';
import { isScreeningActive } from '../../src/utils/screeningUpdate';
import { reservingHandler, reservationsHandler } from '../../src/controllers/reservationController';
import { Reservation, seatsWithStatus } from '../../src/services/reservationService';

const app = express();
app.use(express.json());
app.use('/api', reservationRoutes);

// Mock dependencies
jest.mock('../../src/services/reservationService', () => ({
  getSeatsForScreening: jest.fn(),
  getUserReservations: jest.fn(),
  ReservationService: {
    makeReservation: jest.fn(),
  },
}));

jest.mock('../../src/middlewares/rateLimiter', () => ({
  reservationRateLimiter: jest.fn((_req, _res, next) => next()),
  generalRateLimiter: jest.fn((_req, _res, next) => next()),
}));

jest.mock('../../src/utils/screeningUpdate', () => ({
  isScreeningActive: jest.fn(),
}));

jest.mock('../../src/middlewares/authMiddleware', () => ({
  clientAuthMiddleware: jest.fn((req: Request, _res, next) => {
    (req as Request & { user?: { userId: number; userRole: Role } }).user = {
      userId: 1,
      userRole: 'client' as Role,
    };
    next();
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('Reservation Routes Integration Tests', () => {
  describe('GET /api/screenings/:id/seats', () => {
    it('should respond 200 and return seats when screening is active', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({ success: true });
      (reservationService.getSeatsForScreening as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          { seatId: 1, seatRow: 'A', seatNumber: 1, pmrSeat: false, roomId: 1, isReserved: false },
        ] as seatsWithStatus[],
      });
      const res = await request(app).get('/api/screenings/1/seats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([
        { seatId: 1, seatRow: 'A', seatNumber: 1, pmrSeat: false, roomId: 1, isReserved: false },
      ]);
    });

    it('should respond 400 and return error if screeningId is not present', async () => {
      const res = await request(app).get('/api/screenings/abc/seats');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Screening ID is required');
    });

    it('should respond 400 and return error if screeningId is invalid', async () => {
      const res = await request(app).get('/api/screenings/0/seats');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Invalid Screening ID');
    });

    it('should respond 404 if screening is not found', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Screening not found', code: 'NOT_FOUND' },
      });
      const res = await request(app).get('/api/screenings/999/seats');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should respond 404 if screening was deleted', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Screening is deleted', code: 'NOT_FOUND' },
      });
      const res = await request(app).get('/api/screenings/1/seats');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should respond 410 if screening is no longer available', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Screening has ended', code: 'SCREENING_EXPIRED' },
      });
      const res = await request(app).get('/api/screenings/2/seats');
      expect(res.status).toBe(410);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SCREENING_EXPIRED');
    });

    it('should respond 500 if screening check fails', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
      });
      const res = await request(app).get('/api/screenings/1/seats');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should respond 500 if no seats were found', async () => {
      (reservationService.getSeatsForScreening as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'No seats found for screening', code: 'NOT_FOUND' },
      });
      const res = await request(app).get('/api/screenings/1/seats');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should respond 500 if reservation seat service fails', async () => {
      (reservationService.getSeatsForScreening as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
      });
      const res = await request(app).get('/api/screenings/1/seats');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('POST /api/reserve', () => {
    it('should respond 200 and make a reservation successfully', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({ success: true });
      (ReservationService.makeReservation as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Reservation successful',
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [10, 11] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Reservation successful');
    });

    it('should respond 401 if user is not authenticated', async () => {
      const req: Partial<Request> = { body: { screeningId: 1, seatIds: [1, 2] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const result = await reservingHandler(req as Request);
      const statusCode =
        result && 'error' in result && result.error?.code === 'UNAUTHORIZED' ? 401 : 400;
      res.status(statusCode);
      res.json(result);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    });

    it('should respond 400 if the request data is not valid for the screeningID', async () => {
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: undefined, seatIds: [1, 2] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Invalid request data');
    });

    it('should respond 400 if there is the screeningId is not valid', async () => {
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 0, seatIds: [1, 2] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Invalid Screening ID');
    });

    it('should respond 400 and return error if seatIds are invalid', async () => {
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [0] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Invalid Seat ID');
    });

    it('should respond 400 if the request data is not valid for the seatIds', async () => {
      const res = await request(app).post('/api/reserve').send({ screeningId: 1, seatIds: [] });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Invalid request data');
    });

    it('should respond 404 and return error if screening is deleted', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Screening is deleted', code: 'NOT_FOUND' },
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [5] });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should respond 404 if screening is not found', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Screening not found', code: 'NOT_FOUND' },
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [5] });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should respond 410 if screening is no longer available', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Screening has ended', code: 'SCREENING_EXPIRED' },
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [5] });
      expect(res.status).toBe(410);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SCREENING_EXPIRED');
    });

    it('should respond 500 if screening check fails', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [5] });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should respond 500 and return error if reservation service fails', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({ success: true });
      (ReservationService.makeReservation as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [5] });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should respond 500 and return error if reservation service fails', async () => {
      (isScreeningActive as jest.Mock).mockResolvedValue({ success: true });
      (ReservationService.makeReservation as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
      });
      const res = await request(app)
        .post('/api/reserve')
        .send({ screeningId: 1, seatIds: [5] });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('GET /api/client-reservations', () => {
    it('should respond 200 and return client reservations successfully', async () => {
      (reservationService.getUserReservations as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            reservationId: 1,
            screeningId: 1,
            reservationTotalPrice: 10,
            reservationStatus: 'reserved',
            reservationQrCode: 'mockQrCode',
            reservationSeats: [
              {
                reservationId: 1,
                seatId: 10,
                seat: {
                  seatId: 10,
                  seatRow: 'A',
                  seatNumber: 1,
                  pmrSeat: false as boolean,
                  roomId: 1,
                  room: {
                    roomId: 1,
                    roomNumber: 1,
                    roomCapacity: 100,
                    qualityId: 1,
                    quality: {
                      qualityId: 1,
                      qualityProjectionType: 'IMAX',
                      qualityProjectionPrice: 10,
                    },
                  },
                },
              },
            ],
            screening: {
              screeningId: 1,
              screeningDate: '2023-10-01T12:00:00Z',
              screeningStatus: 'active',
              cinemaId: 1,
              filmId: 1,
              roomId: 1,
              cinema: {
                cinemaId: 1,
                cinemaName: 'Mock Cinema',
              },
              film: {
                filmId: 1,
                filmTitle: 'Mock Film',
              },
            },
          },
        ] as Reservation[],
      });
      const res = await request(app).get('/api/client-reservations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([
        {
          reservationId: 1,
          screeningId: 1,
          reservationTotalPrice: 10,
          reservationStatus: 'reserved',
          reservationQrCode: 'mockQrCode',
          reservationSeats: [
            {
              reservationId: 1,
              seatId: 10,
              seat: {
                seatId: 10,
                seatRow: 'A',
                seatNumber: 1,
                pmrSeat: false as boolean,
                roomId: 1,
                room: {
                  roomId: 1,
                  roomNumber: 1,
                  roomCapacity: 100,
                  qualityId: 1,
                  quality: {
                    qualityId: 1,
                    qualityProjectionType: 'IMAX',
                    qualityProjectionPrice: 10,
                  },
                },
              },
            },
          ],
          screening: {
            screeningId: 1,
            screeningDate: '2023-10-01T12:00:00Z',
            screeningStatus: 'active',
            cinemaId: 1,
            filmId: 1,
            roomId: 1,
            cinema: {
              cinemaId: 1,
              cinemaName: 'Mock Cinema',
            },
            film: {
              filmId: 1,
              filmTitle: 'Mock Film',
            },
          },
        },
      ]);
    });

    it('should respond 401 if user is not authenticated', async () => {
      const req: Partial<Request> = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const result = await reservationsHandler(req as Request);
      const statusCode =
        result && 'error' in result && result.error?.code === 'UNAUTHORIZED' ? 401 : 400;
      res.status(statusCode);
      res.json(result);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    });

    it('should return error if service fails', async () => {
      (reservationService.getUserReservations as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Error retrieving user reservations:', code: 'RESERVATION_ERROR' },
      });
      const res = await request(app).get('/api/client-reservations');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RESERVATION_ERROR');
    });
  });
});
