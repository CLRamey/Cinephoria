import request from 'supertest';
import express from 'express';
import genreRoutes from '../../src/routes/genreRoutes';
import * as service from '../../src/services/genreInfoService';

const app = express();
app.use(express.json());
app.use('/api', genreRoutes);

jest.mock('../../src/services/genreInfoService');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/genre integration test', () => {
  it('should respond 200 and return genre info', async () => {
    (service.getGenreInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          genreId: 1,
          genreType: 'Action',
        },
        {
          genreId: 2,
          genreType: 'Comedy',
        },
      ],
    });

    const response = await request(app).get('/api/genre');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].genreType).toBe('Action');
  });

  it('should respond 404 if no genre info found', async () => {
    (service.getGenreInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Genre information not found', code: 'GENRE_INFO_NOT_FOUND' },
    });

    const response = await request(app).get('/api/genre');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('GENRE_INFO_NOT_FOUND');
  });

  it('should respond 500 on service error', async () => {
    (service.getGenreInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'An error occurred while retrieving genre information.',
        code: 'GENRE_INFO_SERVICE_ERROR',
      },
    });

    const response = await request(app).get('/api/genre');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('GENRE_INFO_SERVICE_ERROR');
  });
});
