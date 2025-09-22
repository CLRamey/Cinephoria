import request from 'supertest';
import express from 'express';
import roomRoutes from '../../src/routes/roomRoutes';
import * as service from '../../src/services/roomInfoService';

jest.mock('../../src/services/roomInfoService');

const app = express();
app.use(express.json());
app.use('/api', roomRoutes);

afterEach(() => {
  jest.clearAllMocks();
});

const baseMockRoomData = [
  {
    toJSON: () => ({
      roomId: 1,
      roomNumber: 1,
      roomCapacity: 100,
      qualityId: 10,
      cinemaId: 5,
      quality: {
        qualityId: 10,
        qualityProjectionType: 'IMAX',
        qualityProjectionPrice: 15.5,
      },
      cinema: {
        cinemaId: 5,
        cinemaName: 'Main Cinema',
      },
    }),
  },
];

describe('GET /api/room', () => {
  it('should return 200 with room info', async () => {
    (service.getRoomInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: baseMockRoomData,
    });
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].roomNumber).toBe(1);
  });

  it('should return 404 if no room data found', async () => {
    (service.getRoomInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'Room information not found.',
        code: 'ROOM_INFO_NOT_FOUND',
      },
    });
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROOM_INFO_NOT_FOUND');
  });

  it('should return 500 on internal service error', async () => {
    (service.getRoomInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'An error occurred while retrieving room information.',
        code: 'ROOM_INFO_SERVICE_ERROR',
      },
    });
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROOM_INFO_SERVICE_ERROR');
  });
});

describe('GET /api/room/:roomId', () => {
  const roomId = 1;
  it('should return 200 with room info by ID', async () => {
    (service.getRoomById as jest.Mock).mockResolvedValue({
      success: true,
      data: [baseMockRoomData[0]],
    });
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].roomId).toBe(roomId);
  });

  it('should return 404 if room not found', async () => {
    (service.getRoomById as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'Room not found',
        code: 'NOT_FOUND',
      },
    });
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on internal service error', async () => {
    (service.getRoomById as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'An error occurred while retrieving room information.',
        code: 'ROOM_INFO_SERVICE_ERROR',
      },
    });
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROOM_INFO_SERVICE_ERROR');
  });
});
