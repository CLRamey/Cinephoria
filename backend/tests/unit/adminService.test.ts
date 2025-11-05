import { getReservationStats, listEmployees } from '../../src/services/adminService';
import { reservation, user } from '../../src/models/init-models';
import { ReservationStat } from '../../src/models/ReservationStats';
import { logerror } from '../../src/utils/logger';
import { Role } from '../../src/validators/userValidator';

jest.mock('../../src/models/init-models');
jest.mock('../../src/models/ReservationStats');
jest.mock('../../src/utils/logger');

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe('getReservationStats', () => {
  const mockSQLData = [
    {
      get: (key: string): string | number => {
        const map: Record<string, string | number> = {
          filmId: 1,
          filmTitle: 'Inception',
          date: '2025-10-25',
          reservationCount: 5,
        };
        return map[key];
      },
    },
  ];

  const mockMongoStats = [
    {
      filmId: 1,
      filmTitle: 'Inception',
      date: '2025-10-25',
      reservationCount: 5,
    },
  ];

  it('should return formatted reservation stats successfully', async () => {
    (reservation.findAll as jest.Mock).mockResolvedValue(mockSQLData);
    (ReservationStat.updateOne as jest.Mock).mockResolvedValue({});

    (ReservationStat.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockMongoStats),
    });
    const result = await getReservationStats();
    expect(reservation.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.any(Array),
        include: expect.any(Array),
        where: expect.any(Object),
        group: expect.any(Array),
        order: expect.any(Array),
      }),
    );
    expect(ReservationStat.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ filmId: 1, date: '2025-10-25' }),
      expect.objectContaining({
        $set: { filmTitle: 'Inception', reservationCount: 5 },
      }),
      { upsert: true },
    );
    expect(ReservationStat.find).toHaveBeenCalledWith(
      expect.objectContaining({
        date: expect.objectContaining({ $gte: expect.any(String) }),
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].filmId).toBe(1);
      expect(result.data?.[0].filmTitle).toBe('Inception');
      expect(result.data?.[0].reservationCount).toBe(5);
    }
  });

  it('should return an empty array if no reservations found in SQL', async () => {
    (reservation.findAll as jest.Mock).mockResolvedValue([]);
    const result = await getReservationStats();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('should return an empty array if no stats found in MongoDB', async () => {
    (reservation.findAll as jest.Mock).mockResolvedValue(mockSQLData);
    (ReservationStat.updateOne as jest.Mock).mockResolvedValue({});
    (ReservationStat.find as jest.Mock).mockResolvedValue([]);
    const result = await getReservationStats();
    expect(result.success).toBe(false);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('should handle internal server errors gracefully', async () => {
    (reservation.findAll as jest.Mock).mockRejectedValue(new Error('SQL error'));
    const result = await getReservationStats();
    expect(logerror).toHaveBeenCalledWith('Error fetching reservation stats:', expect.any(Error));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('INTERNAL_SERVER_ERROR');
    }
  });
});

describe('listEmployees', () => {
  const mockEmployees = [
    {
      userId: 1,
      userFirstName: 'John',
      userLastName: 'Doe',
      userUsername: 'johndoe',
      userEmail: 'john@example.com',
    },
    {
      userId: 2,
      userFirstName: 'Jane',
      userLastName: 'Smith',
      userUsername: 'janesmith',
      userEmail: 'jane@example.com',
    },
  ];

  it('should return a list of employees successfully', async () => {
    (user.findAll as jest.Mock).mockResolvedValue(mockEmployees);
    const result = await listEmployees();
    expect(user.findAll).toHaveBeenCalledWith({
      where: { userRole: Role.EMPLOYEE },
      attributes: ['userId', 'userFirstName', 'userLastName', 'userUsername', 'userEmail'],
      order: [['userLastName', 'ASC']],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].userEmail).toBe('john@example.com');
    }
  });

  it('should return an error response if fetching employees fails', async () => {
    (user.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await listEmployees();
    expect(logerror).toHaveBeenCalledWith('Error fetching employee accounts:', expect.any(Error));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('INTERNAL_SERVER_ERROR');
    }
  });
});
