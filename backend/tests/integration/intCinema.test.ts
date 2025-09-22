import request from 'supertest';
import express from 'express';
import cinemaRoutes from '../../src/routes/cinemaRoutes';
import * as service from '../../src/services/cinemaInfoService';

const app = express();
app.use(express.json());
app.use('/api', cinemaRoutes);

jest.mock('../../src/services/cinemaInfoService');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/cinema integration test', () => {
  it('should respond 200 and return cinema info', async () => {
    (service.getCinemaInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          cinemaName: 'Cinéphoria',
          cinemaAddress: '123 rue du cinéma',
          cinemaPostalCode: '75000',
          cinemaCity: 'Paris',
          cinemaCountry: 'France',
          cinemaTelNumber: '0102030405',
          cinemaOpeningHours: '10h-22h',
        },
      ],
    });
    const response = await request(app).get('/api/cinema');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].cinemaName).toBe('Cinéphoria');
  });

  it('should respond 404 if no cinema info', async () => {
    (service.getCinemaInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Not found', code: 'CINEMA_INFO_NOT_FOUND' },
    });
    const response = await request(app).get('/api/cinema');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('should respond 500 on service error', async () => {
    (service.getCinemaInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Internal error', code: 'CINEMA_INFO_SERVICE_ERROR' },
    });
    const response = await request(app).get('/api/cinema');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
