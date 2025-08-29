import {
  getSeatsForScreening,
  getUserReservations,
  ReservationService,
  seatsWithStatus,
  Reservation,
} from '../../src/services/reservationService';
import {
  screening,
  seat,
  reservation,
  reservationSeat,
  room,
  quality,
  film,
  cinema,
  roomAttributes,
  qualityAttributes,
} from '../../src/models/init-models';
import { sequelize } from '../../src/config/databaseSql';
import { successResponse, errorResponse } from '../../src/interfaces/serviceResponse';
import { Op } from 'sequelize';

jest.mock('../../src/models/init-models');
jest.mock('../../src/config/databaseSql', () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

// Mocked transaction object
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  LOCK: { UPDATE: 'UPDATE' },
};

// Mock sequelize.transaction
(sequelize.transaction as jest.Mock) = jest.fn().mockResolvedValue(mockTransaction);

// Mock room and quality
const mockRoom = { get: jest.fn().mockReturnValue({}) } as unknown as roomAttributes;
const mockQuality = { get: jest.fn().mockReturnValue(10) } as unknown as qualityAttributes; // price per seat = 10

// Successful reservation transaction
describe('ReservationService.makeReservation - success case', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // screening mock
    (screening.findOne as jest.Mock) = jest.fn().mockResolvedValue({
      get: jest.fn((key: string) => {
        if (key === 'room') return { get: jest.fn(() => mockQuality), ...mockRoom };
        if (key === 'roomId') return 1;
        return undefined;
      }),
    });

    // seat mock (all valid seats found)
    (seat.findAll as jest.Mock) = jest.fn().mockResolvedValue([{ seatId: 1 }, { seatId: 2 }]);

    // reservationSeat.findAll mock (no seats already reserved)
    (reservationSeat.findAll as jest.Mock) = jest.fn().mockResolvedValue([]);

    // reservation.create mock
    (reservation.create as jest.Mock) = jest.fn().mockResolvedValue({ reservationId: 123 });

    // reservationSeat.bulkCreate mock
    (reservationSeat.bulkCreate as jest.Mock) = jest.fn().mockResolvedValue([]);
  });

  it('should create reservation successfully', async () => {
    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);

    (screening.findOne as jest.Mock).mockResolvedValue({
      get: jest.fn((key: string) => {
        if (key === 'room') {
          return {
            get: jest.fn(innerKey => {
              if (innerKey === 'quality') {
                return {
                  get: jest.fn(qKey => (qKey === 'qualityProjectionPrice' ? 10 : undefined)),
                };
              }
              return undefined;
            }),
          };
        }
        if (key === 'roomId') return 1;
        return undefined;
      }),
    });

    (seat.findAll as jest.Mock).mockResolvedValue([{ seatId: 1 }, { seatId: 2 }]);
    (reservationSeat.findAll as jest.Mock).mockResolvedValue([]);
    (reservation.create as jest.Mock).mockResolvedValue({ reservationId: 123 });
    (reservationSeat.bulkCreate as jest.Mock).mockResolvedValue([]);

    const result = await ReservationService.makeReservation(1, 99, [1, 2]);

    expect(reservation.create).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(mockTransaction.rollback).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(typeof successResponse).toBe('function');
    expect(Op).toBeDefined();
    expect(room && quality && film && cinema).toBeTruthy();
  });
});

// Reservation Service: makeReservation - rollbacks
describe('ReservationService.makeReservation - rollbacks', () => {
  const mockUserId = 1;
  const mockScreeningId = 100;
  const mockSeatIds = [10, 11];

  it('should rollback if screening not found', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
    (screening.findOne as jest.Mock).mockResolvedValue(null);

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });

  it('should rollback if room not found', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);

    const mockScreening = { get: jest.fn().mockImplementation(key => (key === 'room' ? null : 1)) };
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreening);

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(transaction.commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('should rollback if quality not found', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);

    const mockRoom = { get: jest.fn().mockImplementation(key => (key === 'quality' ? null : 1)) };
    const mockScreening = {
      get: jest.fn().mockImplementation(key => (key === 'room' ? mockRoom : 1)),
    };
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreening);
    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });

  it('should rollback if seats invalid', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);

    const mockScreening = {
      get: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ get: () => 10 }) }),
    };
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreening);
    (seat.findAll as jest.Mock).mockResolvedValue([{ get: () => ({ seatId: 10, roomId: 1 }) }]);

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });

  it('should rollback if seats already reserved', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);

    const mockQuality = { get: jest.fn().mockReturnValue(10) };
    const mockRoom = { get: jest.fn().mockReturnValue(mockQuality) };
    const mockScreening = {
      get: jest.fn().mockImplementation(key => (key === 'roomId' ? 1 : mockRoom)),
    };
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreening);

    (seat.findAll as jest.Mock).mockResolvedValue([
      { get: () => ({ seatId: 10, roomId: 1 }) },
      { get: () => ({ seatId: 11, roomId: 1 }) },
    ]);
    (reservationSeat.findAll as jest.Mock).mockResolvedValue([{ seatId: 10 }]);

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });

  it('should rollback if price per seat not found', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);

    const mockQuality = { get: jest.fn().mockReturnValue(null) };
    const mockRoom = {
      get: jest.fn().mockImplementation(key => (key === 'quality' ? mockQuality : 1)),
    };
    const mockScreening = {
      get: jest.fn().mockImplementation(key => (key === 'room' ? mockRoom : 1)),
    };
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreening);

    (seat.findAll as jest.Mock).mockResolvedValue([
      { get: () => ({ seatId: 10, roomId: 1 }) },
      { get: () => ({ seatId: 11, roomId: 1 }) },
    ]);
    (reservationSeat.findAll as jest.Mock).mockResolvedValue([]);

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });

  it('should rollback if total price not found', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);

    const mockQuality = { get: jest.fn().mockReturnValue(0) }; // price = 0
    const mockRoom = {
      get: jest.fn().mockImplementation(key => (key === 'quality' ? mockQuality : 1)),
    };
    const mockScreening = {
      get: jest.fn().mockImplementation(key => (key === 'room' ? mockRoom : 1)),
    };
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreening);

    (seat.findAll as jest.Mock).mockResolvedValue([
      { get: () => ({ seatId: 10, roomId: 1 }) },
      { get: () => ({ seatId: 11, roomId: 1 }) },
    ]);
    (reservationSeat.findAll as jest.Mock).mockResolvedValue([]);

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });

  it('should rollback on unexpected error', async () => {
    const commit = jest.fn();
    const rollback = jest.fn();
    const transaction = { commit, rollback, LOCK: { UPDATE: 'UPDATE' } };
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
    (screening.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await ReservationService.makeReservation(
      mockUserId,
      mockScreeningId,
      mockSeatIds,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(result).toEqual(errorResponse('Reservation failed', 'RESERVATION_ERROR'));
    expect(rollback).toHaveBeenCalled();
  });
});

describe('Reservation Service', () => {
  // Reservation Service: getSeatsForScreening
  describe('getSeatsForScreening', () => {
    const mockScreeningId = 1;
    const mockRoomId = 10;

    it('should return NOT_FOUND if screening does not exist', async () => {
      (screening.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await getSeatsForScreening(mockScreeningId);
      expect(result).toEqual(errorResponse('Screening not found', 'NOT_FOUND'));
    });

    it('should return NOT_FOUND if no seats found', async () => {
      (screening.findByPk as jest.Mock).mockResolvedValue({ get: () => ({ roomId: mockRoomId }) });
      (seat.findAll as jest.Mock).mockResolvedValue([]);

      const result = await getSeatsForScreening(mockScreeningId);
      expect(result).toEqual(errorResponse('No seats found for screening', 'NOT_FOUND'));
    });

    it('should return seats with correct reservation status', async () => {
      (screening.findByPk as jest.Mock).mockResolvedValue({ get: () => ({ roomId: mockRoomId }) });
      (seat.findAll as jest.Mock).mockResolvedValue([
        {
          get: () => ({
            seatId: 1,
            seatRow: 'A',
            seatNumber: 1,
            pmrSeat: false,
            roomId: mockRoomId,
          }),
        },
        {
          get: () => ({
            seatId: 2,
            seatRow: 'A',
            seatNumber: 2,
            pmrSeat: false,
            roomId: mockRoomId,
          }),
        },
      ]);
      (reservationSeat.findAll as jest.Mock).mockResolvedValue([{ seatId: 2 }]);

      const result = await getSeatsForScreening(mockScreeningId);

      expect(result.success).toBe(true);
      if (result.success) {
        const typedSeats = result.data as seatsWithStatus[];
        const reservedSeat = typedSeats.find(s => s.seatId === 2);
        expect(reservedSeat?.isReserved).toBe(true);
        const freeSeat = typedSeats.find(s => s.seatId === 1);
        expect(freeSeat?.isReserved).toBe(false);
      }
    });

    it('should return INTERNAL_SERVER_ERROR if exception occurs', async () => {
      (screening.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));
      const result = await getSeatsForScreening(mockScreeningId);
      expect(result).toEqual(errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR'));
    });
  });

  // Reservation Service: getUserReservations
  describe('getUserReservations', () => {
    const mockUserId = 1;

    it('should return RESERVATION_NOT_FOUND if no reservations', async () => {
      (reservation.findAll as jest.Mock).mockResolvedValue([]);
      const result = await getUserReservations(mockUserId);
      expect(result).toEqual(errorResponse('No reservations found', 'RESERVATION_NOT_FOUND'));
    });

    it('should return mapped reservations successfully', async () => {
      const mockReservation = {
        toJSON: () =>
          ({
            reservationId: 100,
            screeningId: 1,
            reservationTotalPrice: 20,
            reservationStatus: 'reserved',
            reservationQrCode: 'qr123',
            reservationSeats: [
              {
                reservationId: 100,
                seatId: 1,
                seat: { seatId: 1, seatRow: 'A', seatNumber: 1, pmrSeat: false, roomId: 10 },
              },
            ],
            screening: {
              screeningId: 1,
              screeningDate: new Date().toISOString(),
              cinemaId: 5,
              filmId: 2,
              roomId: 10,
            },
          }) as unknown as Reservation,
      };
      (reservation.findAll as jest.Mock).mockResolvedValue([mockReservation]);

      const result = await getUserReservations(mockUserId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].reservationId).toBe(100);
      }
    });

    it('should return RESERVATION_ERROR if exception occurs', async () => {
      (reservation.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
      const result = await getUserReservations(1);
      expect(result).toEqual(errorResponse('Failed to retrieve reservations', 'RESERVATION_ERROR'));
    });
  });
});
