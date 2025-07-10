import { getRoomInfo, getRoomById } from '../../src/services/roomInfoService';
import { room } from '../../src/models/init-models';

jest.mock('../../src/models/init-models');

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

describe('getRoomInfo', () => {
  it('should return room data successfully', async () => {
    (room.findAll as jest.Mock).mockResolvedValue(baseMockRoomData);
    const result = await getRoomInfo();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].roomNumber).toBe(1);
      expect(result.data?.[0].quality?.qualityProjectionType).toBe('IMAX');
    }
  });

  it('should return error if no rooms found', async () => {
    (room.findAll as jest.Mock).mockResolvedValue([]);
    const result = await getRoomInfo();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ROOM_INFO_NOT_FOUND');
    }
  });

  it('should handle exceptions and return service error', async () => {
    (room.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
    const result = await getRoomInfo();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ROOM_INFO_SERVICE_ERROR');
    }
  });
});

describe('getRoomById', () => {
  it('should return specific room by ID', async () => {
    (room.findByPk as jest.Mock).mockResolvedValue(baseMockRoomData[0]);
    const result = await getRoomById(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.[0].roomNumber).toBe(1);
      expect(result.data?.[0].cinema?.cinemaName).toBe('Main Cinema');
    }
  });

  it('should return NOT_FOUND error for invalid room ID', async () => {
    (room.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await getRoomById(999);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('NOT_FOUND');
    }
  });

  it('should handle exceptions and return service error', async () => {
    (room.findByPk as jest.Mock).mockRejectedValue(new Error('Unexpected DB Error'));
    const result = await getRoomById(5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('ROOM_INFO_SERVICE_ERROR');
    }
  });
});
