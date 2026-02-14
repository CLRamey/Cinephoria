import request from 'supertest';
import express from 'express';
import staffRoutes from '../../src/routes/staffRoutes';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';
import { Response, NextFunction } from 'express';
import { Role } from '../../src/validators/userValidator';
import {
  listFilms,
  createFilm,
  modifyFilm,
  deleteFilm,
  createRoom,
  listRooms,
  modifyRoom,
  deleteRoom,
  createScreening,
  listScreenings,
  modifyScreening,
  deleteScreening,
} from '../../src/services/crudService';

const app = express();
app.use(express.json());
// Mock staff authentication middleware
jest.mock('../../src/middlewares/authMiddleware', () => ({
  staffAuthMiddleware: [
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      req.user = {
        userId: 1,
        userRole: Role.ADMIN,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      next();
    },
  ],
}));
app.use('/api', staffRoutes);

// Mock the uuid module for Jest
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));
jest.mock('../../src/services/crudService');
jest.mock('../../src/utils/sanitize', () => ({
  sanitizeFilmInput: jest.fn(data => data),
}));
jest.mock('../../src/validators/userValidator', () => ({
  ...jest.requireActual('../../src/validators/userValidator'),
  isPositiveNumber: jest.fn((value: unknown) => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }),
  validateFilmInput: jest.fn(data => data),
}));
jest.mock('../../src/models/init-models', () => ({
  initModels: jest.fn(() => ({
    film: {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    },
    genre: {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    },
    genreFilm: {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    },
    room: {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    },
    screening: {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    },
  })),
}));

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

// Helper to get the next Wednesday from today
function getNextWednesday(): Date {
  const date = new Date();
  const day = date.getDay(); // Sunday=0 ... Saturday=6
  const diff = (3 - day + 7) % 7 || 7; // 3 = Wednesday
  date.setDate(date.getDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
const nextWednesday = getNextWednesday();

const mockFilmData = {
  filmData: {
    filmTitle: 'Inception',
    filmDescription: 'A mind bending thriller',
    filmImg: 'https://example.com/inception.webp',
    filmDuration: 120,
    filmFavorite: true,
    filmMinimumAge: 6,
    filmActiveDate: nextWednesday.toISOString(),
  },
};

const mockGenreData = [2];

const mockFilmModifyData = {
  filmData: {
    filmTitle: 'Inception',
    filmDescription: 'A mind bending thriller altered',
    filmImg: 'https://example.com/inception.webp',
    filmDuration: 120,
    filmFavorite: true,
    filmMinimumAge: 6,
    filmActiveDate: nextWednesday.toISOString(),
  },
};

const mockFilmErrorModifyData = {
  filmTitle: 'Inception',
  filmDescription: 'A mind bending thriller altered',
  filmImg: 'https://example.com/inception.webp',
  filmDuration: 120,
  filmFavorite: true,
  filmMinimumAge: 6,
  filmActiveDate: nextWednesday.toISOString(),
};

const mockFilmModifiedResponse = {
  film: [
    {
      filmId: 1,
      filmTitle: 'Inception',
      filmDescription: 'A mind bending thriller altered',
      filmImg: 'https://example.com/inception.webp',
      filmDuration: 120,
      filmFavorite: true,
      filmMinimumAge: 6,
      filmActiveDate: nextWednesday.toISOString(),
      genreFilms: [2, 4],
    },
  ],
};

const mockFilmResponse = {
  films: [
    {
      filmId: 1,
      filmTitle: 'Inception',
      filmDescription: 'A mind bending thriller',
      filmImg: 'https://example.com/inception.webp',
      filmDuration: 120,
      filmFavorite: true,
      filmMinimumAge: 6,
      filmActiveDate: nextWednesday.toISOString(),
      genreFilms: [2, 4],
    },
  ],
};

describe('CRUD Film Controller Integration Tests', () => {
  describe('GET /api/staff/films', () => {
    it('should return 200 and the film data on success when listing films succeeds', async () => {
      (listFilms as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockFilmData],
      });
      const response = await request(app).get('/api/staff/films');
      expect(listFilms).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockFilmData],
      });
    });

    it('should return 400 when listing films fails due to invalid data', async () => {
      (listFilms as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Failed to list films' },
      });
      const response = await request(app).get('/api/staff/films');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Failed to list films' },
      });
    });

    it('should return 500 when listing films fails', async () => {
      (listFilms as jest.Mock).mockResolvedValue({ success: false });
      const response = await request(app).get('/api/staff/films');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });

  describe('POST /api/staff/films', () => {
    it('should return 200 on success when creating a film succeeds', async () => {
      (createFilm as jest.Mock).mockResolvedValue({
        success: true,
        data: mockFilmResponse,
      });
      const response = await request(app)
        .post('/api/staff/films')
        .send({ ...mockFilmData, genreIds: mockGenreData });
      expect(createFilm).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockFilmResponse,
      });
    });

    it('should return 400 when genreIds are invalid', async () => {
      const response = await request(app)
        .post('/api/staff/films')
        .send({ ...mockFilmData, genreIds: [0] });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Genre IDs');
    });

    it('should return 400 when film attributes are missing', async () => {
      const response = await request(app)
        .post('/api/staff/films')
        .send({ filmData: {}, genreIds: [1] });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Missing film attribute');
    });

    it('should return 400 when genreIds is not an array', async () => {
      const response = await request(app)
        .post('/api/staff/films')
        .send({ ...mockFilmData, genreIds: 'not-an-array' });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('At least one genre ID must be provided');
    });

    it('should return 400 if genreId is negative', async () => {
      const response = await request(app)
        .post('/api/staff/films')
        .send({ ...mockFilmData, genreIds: [-1] });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Genre IDs must be positive integers');
    });

    it('should return 500 if createFilm service fails', async () => {
      (createFilm as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app)
        .post('/api/staff/films')
        .send({ ...mockFilmData, genreIds: [2] });
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/staff/films/:filmId', () => {
    it('should return 200 on success when modifying a film', async () => {
      (modifyFilm as jest.Mock).mockResolvedValue({
        success: true,
        data: mockFilmModifiedResponse,
      });
      const response = await request(app)
        .put('/api/staff/films/1')
        .send({ ...mockFilmModifyData, genreIds: [2] });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockFilmModifiedResponse,
      });
    });

    it('should return 400 for invalid film ID', async () => {
      const response = await request(app)
        .put('/api/staff/films/0')
        .send({ ...mockFilmData, genreIds: [2] });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid film ID');
    });

    it('should return 400 for negative genre IDs', async () => {
      const response = await request(app)
        .put('/api/staff/films/1')
        .send({ ...mockFilmData, genreIds: [-1] });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Genre IDs must be positive integers');
    });

    it('should return 400 when genreIds is not an array', async () => {
      const response = await request(app)
        .put('/api/staff/films/1')
        .send({ ...mockFilmData, genreIds: 'not-an-array' });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('At least one genre ID must be provided');
    });

    it('should return 500 when service modify fails', async () => {
      (modifyFilm as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app)
        .put('/api/staff/films/1')
        .send({ ...mockFilmErrorModifyData, genreIds: [2] });
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/staff/films/:filmId', () => {
    it('should return 200 on success when deleting a film', async () => {
      (deleteFilm as jest.Mock).mockResolvedValue({
        success: true,
        data: { deleted: true },
      });
      const response = await request(app).delete(`/api/staff/films/1`);
      expect(deleteFilm).toHaveBeenCalledWith(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { deleted: true },
      });
    });

    it('should return 400 for invalid film ID', async () => {
      const response = await request(app).delete('/api/staff/films/0');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid film ID');
    });

    it('should return 500 when service delete fails', async () => {
      (deleteFilm as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'FILM_REMOVAL_ERROR', message: 'Failed to remove film' },
      });
      const response = await request(app).delete(`/api/staff/films/1`);
      expect(response.status).toBe(500); // assuming errorResponse maps FILM_REMOVAL_ERROR → 500
      expect(response.body.success).toBe(false);
    });
  });
});

const mockCreateRoomData = {
  roomData: {
    roomNumber: 5,
    qualityId: 2,
    cinemaId: 1,
  },
};

const mockRoomData = {
  rooms: [
    {
      roomNumber: 5,
      qualityId: 2,
      cinemaId: 1,
      roomCapacity: 50,
      quality: {
        qualityId: 2,
        qualityProjectionType: '3D',
      },
      cinema: {
        cinemaId: 1,
        cinemaName: 'Cineplex',
      },
    },
  ],
};

const mockRoomResponseData = {
  room: {
    dataValues: {
      roomId: 1,
      roomNumber: 5,
      qualityId: 2,
      cinemaId: 1,
      roomCapacity: 50,
      quality: {
        qualityId: 2,
        qualityProjectionType: '3D',
      },
      cinema: {
        cinemaId: 1,
        cinemaName: 'Cineplex',
      },
    },
  },
};

describe('CRUD Room Controller Integration Tests', () => {
  describe('GET /api/staff/rooms/:cinemaId', () => {
    it('should return 200 and the room data on success when listing rooms succeeds', async () => {
      (listRooms as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockRoomData],
      });
      const response = await request(app).get('/api/staff/rooms/1');
      expect(listRooms).toHaveBeenCalledWith(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockRoomData],
      });
    });

    it('should return 400 for invalid cinema ID', async () => {
      const response = await request(app).get('/api/staff/rooms/0');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid cinema ID');
    });

    it('should return 500 when listing rooms fails', async () => {
      (listRooms as jest.Mock).mockResolvedValue({ success: false });
      const response = await request(app).get('/api/staff/rooms/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });

  describe('POST /api/staff/rooms', () => {
    it('should return 200 on success when creating a room succeeds', async () => {
      (createRoom as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockRoomResponseData],
      });
      const response = await request(app).post('/api/staff/rooms').send({
        roomData: mockCreateRoomData.roomData,
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockRoomResponseData],
      });
    });

    it('should return 400 when missing required fields', async () => {
      (createRoom as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing required room data or seating info' },
      });
      const response = await request(app).post('/api/staff/rooms').send(mockCreateRoomData);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing required room data or seating info' },
      });
    });

    it('should return 400 for invalid room roomNumber attributes', async () => {
      const response = await request(app)
        .post('/api/staff/rooms')
        .send({
          roomData: { roomNumber: 0, qualityId: 2, cinemaId: 1 },
          numRows: 5,
          seatsPerRow: 10,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Missing room attribute');
    });

    it('should return 400 for invalid room quality attributes', async () => {
      const response = await request(app)
        .post('/api/staff/rooms')
        .send({
          roomData: { roomNumber: 5, qualityId: 0, cinemaId: 1 },
          numRows: 5,
          seatsPerRow: 10,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Missing room attribute');
    });

    it('should return 400 for invalid room cinema attributes', async () => {
      const response = await request(app)
        .post('/api/staff/rooms')
        .send({
          roomData: { roomNumber: 5, qualityId: 2, cinemaId: 0 },
          numRows: 5,
          seatsPerRow: 10,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Missing room attribute');
    });

    it('should return 400 for negative roomData attributes', async () => {
      const response = await request(app)
        .post('/api/staff/rooms')
        .send({
          roomData: { roomNumber: -5, qualityId: -2, cinemaId: -1 },
          numRows: 5,
          seatsPerRow: 10,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Room attributes must be positive integers');
    });

    it('should return 400 for invalid seating numRows attributes', async () => {
      const response = await request(app)
        .post('/api/staff/rooms')
        .send({
          roomData: { roomNumber: 5, qualityId: 2, cinemaId: 1 },
          numRows: -1,
          seatsPerRow: 10,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        'Rows and seats per row must be positive integers',
      );
    });

    it('should return 400 for invalid seating seatsPerRow attributes', async () => {
      const response = await request(app)
        .post('/api/staff/rooms')
        .send({
          roomData: { roomNumber: 5, qualityId: 2, cinemaId: 1 },
          numRows: 5,
          seatsPerRow: -1,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        'Rows and seats per row must be positive integers',
      );
    });

    it('should return 500 if createRoom service fails', async () => {
      (createRoom as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app).post('/api/staff/rooms').send({
        roomData: mockCreateRoomData.roomData,
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/staff/rooms/:roomId', () => {
    it('should return 200 on success when modifying a room', async () => {
      (modifyRoom as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRoomResponseData,
      });
      const response = await request(app).put('/api/staff/rooms/1').send({
        roomData: mockCreateRoomData.roomData,
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockRoomResponseData,
      });
    });

    it('should return 400 for invalid room ID', async () => {
      const response = await request(app).put('/api/staff/rooms/0').send({
        roomData: mockCreateRoomData.roomData,
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid room ID');
    });

    it('s should return 400 for invalid room roomNumber attributes', async () => {
      const response = await request(app).put('/api/staff/rooms/1').send({
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Missing required room data or seating info');
    });

    it('s should return 400 for invalid room roomNumber attributes', async () => {
      const response = await request(app).put('/api/staff/rooms/1').send({
        roomData: {},
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Missing room attribute');
    });

    it('should return 400 for invalid room quality attributes', async () => {
      const response = await request(app)
        .put('/api/staff/rooms/1')
        .send({
          roomData: { roomNumber: 5, qualityId: -2, cinemaId: 1 },
          numRows: 5,
          seatsPerRow: 10,
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Room attributes must be positive integers');
    });

    it('should return 500 when service modify fails', async () => {
      (modifyRoom as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app).put('/api/staff/rooms/1').send({
        roomData: mockCreateRoomData.roomData,
        numRows: 5,
        seatsPerRow: 10,
      });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });

  describe('DELETE /api/staff/rooms/:roomId', () => {
    it('should return 200 on success when deleting a room', async () => {
      (deleteRoom as jest.Mock).mockResolvedValue({
        success: true,
      });
      const response = await request(app).delete('/api/staff/rooms/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
      });
    });

    it('should return 400 for invalid room ID', async () => {
      const response = await request(app).delete('/api/staff/rooms/0');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid room ID');
    });

    it('should return 400 for negative roomId', async () => {
      const response = await request(app).delete('/api/staff/rooms/-1');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Invalid room ID');
    });

    it('should return 500 when service delete fails', async () => {
      (deleteRoom as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app).delete('/api/staff/rooms/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });
});

const NewScreeningDate = new Date();
NewScreeningDate.setDate(NewScreeningDate.getDate() + 7);

const ModifiedDate = new Date();
ModifiedDate.setDate(ModifiedDate.getDate() + 14);

const mockCreateScreeningData = {
  screeningData: {
    cinemaId: 1,
    roomId: 1,
    filmId: 1,
    screeningDate: NewScreeningDate.toISOString(),
  },
};

const mockModifiedScreeningData = {
  screeningData: {
    cinemaId: 1,
    roomId: 1,
    filmId: 1,
    screeningDate: ModifiedDate.toISOString(),
  },
};

const mockErrorScreeningData = {
  screeningData: {
    cinemaId: 0,
    roomId: 0,
    filmId: 0,
  },
};

describe('CRUD Screening Controller Integration Tests', () => {
  describe('GET /api/staff/screenings/:cinemaId/:roomId/:filmId', () => {
    it('should return 200 and the screening data on success when listing screenings succeeds', async () => {
      (listScreenings as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });
      const response = await request(app).get('/api/staff/screenings/1/1/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 400 when listing screenings fails due to invalid parameters', async () => {
      (listScreenings as jest.Mock).mockResolvedValue({ success: false });
      const response = await request(app).get('/api/staff/screenings/abc/1/1');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Cinema and Room IDs must be positive integers' },
      });
    });

    it('should return 400 if cinemaId or roomId are negative', async () => {
      const response = await request(app).get('/api/staff/screenings/-1/1/1');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        'Cinema and Room IDs must be positive integers',
      );
    });

    it('should return 400 if filmId is negative', async () => {
      const response = await request(app).get('/api/staff/screenings/1/1/-1');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Film ID must be a positive integer');
    });

    it('should return 500 when listing screenings fails', async () => {
      (listScreenings as jest.Mock).mockResolvedValue({ success: false });
      const response = await request(app).get('/api/staff/screenings/1/1/1');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });

  describe('POST /api/staff/screenings', () => {
    it('should return 200 on success when creating a screening succeeds', async () => {
      (createScreening as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCreateScreeningData],
      });
      const response = await request(app)
        .post('/api/staff/screenings')
        .send(mockCreateScreeningData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockCreateScreeningData],
      });
    });

    it('should return 400 when missing required fields', async () => {
      (createScreening as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing screening attributes' },
      });
      const response = await request(app)
        .post('/api/staff/screenings')
        .send(mockErrorScreeningData);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing screening attributes' },
      });
    });

    it('should return 400 for invalid screeningDate', async () => {
      const response = await request(app)
        .post('/api/staff/screenings')
        .send({
          screeningData: {
            cinemaId: 1,
            roomId: 1,
            filmId: 1,
            screeningDate: 'invalid-date',
          },
        });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        'Screening date must be a valid future date and time',
      );
    });

    it('should return 500 if createScreening service fails', async () => {
      (createScreening as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app)
        .post('/api/staff/screenings')
        .send(mockCreateScreeningData);
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/staff/screenings/:screeningId', () => {
    it('should return 200 on success when modifying a screening succeeds', async () => {
      (modifyScreening as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockModifiedScreeningData],
      });
      const response = await request(app)
        .put('/api/staff/screenings/1')
        .send(mockModifiedScreeningData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [mockModifiedScreeningData],
      });
    });

    it('should return 400 when modifying a screening fails due to invalid data', async () => {
      (modifyScreening as jest.Mock).mockResolvedValue({ success: false });
      const response = await request(app)
        .put('/api/staff/screenings/abc')
        .send(mockModifiedScreeningData);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid screening ID' },
      });
    });

    it('should return 500 when modifying a screening fails', async () => {
      (modifyScreening as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
      const response = await request(app)
        .put('/api/staff/screenings/1')
        .send(mockModifiedScreeningData);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });

  describe('DELETE /api/staff/screenings/:screeningId', () => {
    it('should return 200 on success when deleting a screening succeeds', async () => {
      (deleteScreening as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCreateScreeningData],
      });
      const response = await request(app).delete('/api/staff/screenings/1').send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: [mockCreateScreeningData] });
    });

    it('should return 400 when deleting a screening with invalid ID', async () => {
      const response = await request(app).delete('/api/staff/screenings/abc').send();
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid screening ID' },
      });
    });

    it('should return 500 when deleting a screening fails', async () => {
      (deleteScreening as jest.Mock).mockResolvedValue({ success: false });
      const response = await request(app).delete('/api/staff/screenings/1').send();
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      });
    });
  });
});
