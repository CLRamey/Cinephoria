// tests/integration/filmRoutes.test.ts
import request from 'supertest';
import express from 'express';
import filmRoutes from '../../src/routes/filmRoutes';
import * as service from '../../src/services/filmInfoService';

jest.mock('../../src/services/filmInfoService');

const app = express();
app.use(express.json());
app.use('/api', filmRoutes);

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

const baseMockFilmData = [
  {
    toJSON: () => ({
      filmId: 1,
      filmTitle: 'The Great Adventure',
      filmDescription: 'An epic journey of discovery and survival.',
      filmImg: 'great-adventure.webp',
      filmDuration: 120,
      filmMinimumAge: 12,
      filmActiveDate: '2025-07-01',
      filmPublishingState: 'active',
      filmAverageRating: 4.5,
      genreFilms: [
        {
          genreId: 1,
          filmId: 1,
          genre: {
            genreId: 1,
            genreType: 'Adventure',
          },
        },
      ],
      cinemaFilms: [
        {
          cinemaId: 1,
          filmId: 1,
          cinema: {
            cinemaId: 1,
            cinemaName: 'Cinéphoria Central',
          },
        },
      ],
      screenings: [
        {
          screeningId: 10,
          screeningDate: '2025-07-10T15:00:00Z',
          screeningStatus: 'active',
          roomId: 5,
          filmId: 1,
          cinemaId: 1,
        },
      ],
    }),
  },
];

describe('GET /api/film', () => {
  it('should return 200 with film info', async () => {
    (service.getFilmInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: baseMockFilmData,
    });
    const res = await request(app).get('/api/film');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].filmTitle).toBe('The Great Adventure');
  });

  it('should return 404 if no film data found', async () => {
    (service.getFilmInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'Cinema information not found.',
        code: 'FILM_INFO_NOT_FOUND',
      },
    });
    const res = await request(app).get('/api/film');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FILM_INFO_NOT_FOUND');
  });

  it('should return 500 on internal service error', async () => {
    (service.getFilmInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'An error occurred while retrieving film information.',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    });
    const res = await request(app).get('/api/film');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FILM_INFO_SERVICE_ERROR');
  });
});

describe('GET /api/films/:filmId', () => {
  const filmId = 1;
  it('should return 200 with film info by ID', async () => {
    (service.getFilmInfoById as jest.Mock).mockResolvedValue({
      success: true,
      data: [baseMockFilmData[0]],
    });
    const res = await request(app).get(`/api/film/${filmId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].filmId).toBe(filmId);
  });

  it('should return 404 if film not found', async () => {
    (service.getFilmInfoById as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'Film not found',
        code: 'NOT_FOUND',
      },
    });
    const res = await request(app).get(`/api/film/${filmId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on internal service error', async () => {
    (service.getFilmInfoById as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'An error occurred while retrieving film information by ID.',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    });
    const res = await request(app).get(`/api/film/${filmId}`);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FILM_INFO_SERVICE_ERROR');
  });
});
