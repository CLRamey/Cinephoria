import {
  createFilm,
  listFilms,
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
import {
  film,
  genre,
  genreFilm,
  room,
  cinema,
  quality,
  seat,
  screening,
  reservationSeat,
  reservation,
} from '../../src/models/init-models';
import { sequelize } from '../../src/config/databaseSql';

jest.mock('../../src/models/init-models');
jest.mock('../../src/config/databaseSql', () => ({
  sequelize: { transaction: jest.fn() },
}));
jest.mock('../../src/utils/logger');

let mockTransaction: { commit: jest.Mock; rollback: jest.Mock };

beforeEach(() => {
  mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);
});

afterEach(() => {
  jest.clearAllMocks();
});

// --- FILM CRUD TESTS ---
describe('Film CRUD operations', () => {
  const mockFilmData = { filmId: 1, filmTitle: 'Inception', filmPublishingState: 'active' };

  it('should create a new film successfully', async () => {
    (film.findOne as jest.Mock).mockResolvedValue(null);
    (genre.findAll as jest.Mock).mockResolvedValue([{ genreId: 1 }]);
    (film.create as jest.Mock).mockResolvedValue(mockFilmData);
    (genreFilm.bulkCreate as jest.Mock).mockResolvedValue([]);
    const result = await createFilm(mockFilmData as Parameters<typeof createFilm>[0], [1]);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
    if (result.success) {
      expect(result.data).toEqual(mockFilmData);
    }
  });

  it('should fail to create a film if a film with the same title already exists', async () => {
    (film.findOne as jest.Mock).mockResolvedValue(mockFilmData);
    (genre.findAll as jest.Mock).mockResolvedValue([]);
    const result = await createFilm(mockFilmData as Parameters<typeof createFilm>[0], [99]);
    expect(result.success).toBe(false);
    expect(mockTransaction.rollback).toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create film');
    }
  });

  it('should throw error on create film if genres are not found', async () => {
    (film.findOne as jest.Mock).mockResolvedValue(null);
    (genre.findAll as jest.Mock).mockResolvedValue([]);
    const result = await createFilm(mockFilmData as Parameters<typeof createFilm>[0], [99]);
    expect(result.success).toBe(false);
    expect(mockTransaction.rollback).toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create film');
    }
  });

  it('should throw error on create films if there is a database error', async () => {
    (film.findOne as jest.Mock).mockResolvedValue(null);
    (genre.findAll as jest.Mock).mockResolvedValue([{ genreId: 1 }]);
    (film.create as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await createFilm(mockFilmData as Parameters<typeof createFilm>[0], [1]);
    expect(result.success).toBe(false);
    expect(mockTransaction.rollback).toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create film');
    }
  });

  it('should list films successfully', async () => {
    const mockFilms = [
      {
        ...mockFilmData,
        genreFilms: [{ genre: { genreId: 1, genreName: 'Action' } }],
      },
    ];
    (film.findAll as jest.Mock).mockResolvedValue(mockFilms);
    const result = await listFilms();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.[0].genres).toEqual([{ genreId: 1, genreName: 'Action' }]);
    }
  });

  it('should fail to modify film if there is a database error', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue({ filmId: 1 });
    (genre.findAll as jest.Mock).mockResolvedValue([{ genreId: 1 }]);
    (film.update as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await modifyFilm(1, mockFilmData as Parameters<typeof modifyFilm>[1], [1]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify film');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should modify film successfully', async () => {
    const mockFilmInstance = { update: jest.fn(), filmId: 1 };
    (film.findByPk as jest.Mock).mockResolvedValue(mockFilmInstance);
    (genre.findAll as jest.Mock).mockResolvedValue([{ genreId: 1 }]);
    (genreFilm.destroy as jest.Mock).mockResolvedValue(1);
    (genreFilm.bulkCreate as jest.Mock).mockResolvedValue([]);
    const result = await modifyFilm(1, mockFilmData as Parameters<typeof modifyFilm>[1], [1]);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should fail to modify film if film not found', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await modifyFilm(1, mockFilmData as Parameters<typeof modifyFilm>[1], [1]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify film');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should fail to modify film if genres are not found', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue({ filmId: 1 });
    (genre.findAll as jest.Mock).mockResolvedValue([]);
    const result = await modifyFilm(1, mockFilmData as Parameters<typeof modifyFilm>[1], [99]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify film');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should fail to modify film if there is a database error', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue({ filmId: 1 });
    (genre.findAll as jest.Mock).mockResolvedValue([{ genreId: 1 }]);
    (film.update as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await modifyFilm(1, mockFilmData as Parameters<typeof modifyFilm>[1], [1]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify film');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should delete film successfully', async () => {
    const mockFilmInstance = { update: jest.fn(), filmId: 1 };
    (film.findByPk as jest.Mock).mockResolvedValue(mockFilmInstance);
    const result = await deleteFilm(1);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should fail to delete film if film not found', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await deleteFilm(1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to remove film');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });
});

// --- ROOM CRUD TESTS ---
describe('Room CRUD operations', () => {
  const mockRoomData = {
    roomId: 1,
    cinemaId: 1,
    qualityId: 1,
    roomNumber: 5,
    roomCapacity: 50,
  };

  it('should create a room successfully', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (quality.findByPk as jest.Mock).mockResolvedValue({ qualityId: 1 });
    (room.findOne as jest.Mock).mockResolvedValue(null);
    (room.create as jest.Mock).mockResolvedValue(mockRoomData);
    (seat.bulkCreate as jest.Mock).mockResolvedValue([]);
    const result = await createRoom(mockRoomData as Parameters<typeof createRoom>[0], 5, 10);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw error on create room if the cinema is not found', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await createRoom(mockRoomData as Parameters<typeof createRoom>[0], 5, 10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error on create room if the quality is not found', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (quality.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await createRoom(mockRoomData as Parameters<typeof createRoom>[0], 5, 10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error on create room if room number already exists in the cinema', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (quality.findByPk as jest.Mock).mockResolvedValue({ qualityId: 1 });
    (room.findOne as jest.Mock).mockResolvedValue(mockRoomData);
    const result = await createRoom(mockRoomData as Parameters<typeof createRoom>[0], 5, 10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should create seats when creating a room', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (quality.findByPk as jest.Mock).mockResolvedValue({ qualityId: 1 });
    (room.findOne as jest.Mock).mockResolvedValue(null);
    (room.create as jest.Mock).mockResolvedValue(mockRoomData);
    (seat.bulkCreate as jest.Mock).mockResolvedValue([]);
    const result = await createRoom(mockRoomData as Parameters<typeof createRoom>[0], 4, 5);
    expect(result.success).toBe(true);
    expect(seat.bulkCreate).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should list rooms successfully', async () => {
    (room.findAll as jest.Mock).mockResolvedValue([mockRoomData]);
    const result = await listRooms(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toEqual(mockRoomData);
    }
  });

  it('should throw error on list rooms if there is a database error', async () => {
    (room.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await listRooms(1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to list rooms');
    }
  });

  it('should modify room successfully', async () => {
    const mockRoomInstance = {
      roomId: 1,
      cinemaId: 1,
      qualityId: 1,
      roomCapacity: 20,
      update: jest.fn(),
    };
    (room.findOne as jest.Mock).mockResolvedValue(mockRoomInstance);
    (reservationSeat.count as jest.Mock).mockResolvedValue(0);
    (seat.destroy as jest.Mock).mockResolvedValue(1);
    (seat.bulkCreate as jest.Mock).mockResolvedValue([]);
    const result = await modifyRoom(1, mockRoomData as Parameters<typeof modifyRoom>[1], 4, 5);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should fail to modify room if the room is not found', async () => {
    (room.findOne as jest.Mock).mockResolvedValue(null);
    const result = await modifyRoom(1, mockRoomData as Parameters<typeof modifyRoom>[1], 4, 5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should fail to modify room if the cinema is not found', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await modifyRoom(1, mockRoomData as Parameters<typeof modifyRoom>[1], 4, 5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should fail to modify room if the quality is not found', async () => {
    (quality.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await modifyRoom(1, mockRoomData as Parameters<typeof modifyRoom>[1], 4, 5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should fail to modify room if there are existing reservations', async () => {
    const mockRoomInstance = {
      roomId: 1,
      cinemaId: 1,
      qualityId: 1,
      roomCapacity: 20,
    };
    (room.findOne as jest.Mock).mockResolvedValue(mockRoomInstance);
    (reservationSeat.count as jest.Mock).mockResolvedValue(1);
    const result = await modifyRoom(1, mockRoomData as Parameters<typeof modifyRoom>[1], 4, 5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to modify room');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should update the room capacity when modifying a room', async () => {
    const mockRoomInstance = {
      roomId: 1,
      cinemaId: 1,
      qualityId: 1,
      numRows: 4,
      seatsPerRow: 5,
      update: jest.fn(),
    };
    (room.findOne as jest.Mock).mockResolvedValue(mockRoomInstance);
    (reservationSeat.count as jest.Mock).mockResolvedValue(0);
    (seat.destroy as jest.Mock).mockResolvedValue(1);
    (seat.bulkCreate as jest.Mock).mockResolvedValue([]);
    const result = await modifyRoom(1, mockRoomData as Parameters<typeof modifyRoom>[1], 4, 5);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should delete room successfully', async () => {
    const mockRoomInstance = { update: jest.fn() };
    (room.findByPk as jest.Mock).mockResolvedValue(mockRoomInstance);
    const result = await deleteRoom(1);
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should fail to delete room if the room is not found', async () => {
    (room.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await deleteRoom(999);
    expect(result.success).toBe(false);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });
});

// --- SCREENING CRUD TESTS ---
describe('Screening CRUD operations', () => {
  const mockScreeningData = {
    screeningId: 1,
    cinemaId: 1,
    roomId: 1,
    filmId: 1,
    screeningDate: new Date('2025-10-30T10:00:00Z'),
  };

  it('should create screening successfully', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (room.findByPk as jest.Mock).mockResolvedValue({ roomId: 1 });
    (film.findByPk as jest.Mock).mockResolvedValue({ filmId: 1 });
    (screening.findOne as jest.Mock).mockResolvedValue(null);
    (screening.create as jest.Mock).mockResolvedValue(mockScreeningData);

    const result = await createScreening(
      mockScreeningData as Parameters<typeof createScreening>[0],
    );
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw error on create screening if there is a database error', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (room.findByPk as jest.Mock).mockResolvedValue({ roomId: 1 });
    (film.findByPk as jest.Mock).mockResolvedValue({ filmId: 1 });
    (screening.findOne as jest.Mock).mockResolvedValue(null);
    (screening.create as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await createScreening(
      mockScreeningData as Parameters<typeof createScreening>[0],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create screening');
    }
  });

  it('should throw error and rollback on create screening if cinema is not found', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await createScreening(
      mockScreeningData as Parameters<typeof createScreening>[0],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create screening');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error and rollback on create screening if room is not found', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (room.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await createScreening(
      mockScreeningData as Parameters<typeof createScreening>[0],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create screening');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error and rollback on create screening if film is not found', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (room.findByPk as jest.Mock).mockResolvedValue({ roomId: 1 });
    (film.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await createScreening(
      mockScreeningData as Parameters<typeof createScreening>[0],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create screening');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error and rollback on create screening if there is a scheduling conflict', async () => {
    (cinema.findByPk as jest.Mock).mockResolvedValue({ cinemaId: 1 });
    (room.findByPk as jest.Mock).mockResolvedValue({ roomId: 1 });
    (film.findByPk as jest.Mock).mockResolvedValue({ filmId: 1 });
    (screening.findOne as jest.Mock).mockResolvedValue(mockScreeningData);
    const result = await createScreening(
      mockScreeningData as Parameters<typeof createScreening>[0],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to create screening');
    }
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should list screenings successfully', async () => {
    (screening.findAll as jest.Mock).mockResolvedValue([mockScreeningData]);
    const result = await listScreenings(1, 1, 0);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toEqual(mockScreeningData);
    }
  });

  it('should throw error on list screenings if there is a database error', async () => {
    (screening.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await listScreenings(1, 1, 0);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to list screenings');
    }
  });

  it('should modify screening successfully', async () => {
    const mockScreeningInstance = {
      screeningId: 1,
      cinemaId: 1,
      roomId: 1,
      screeningDate: new Date('2025-10-29T10:00:00Z'),
      update: jest.fn(),
    };
    (screening.findByPk as jest.Mock).mockResolvedValue(mockScreeningInstance);
    (reservation.count as jest.Mock).mockResolvedValue(0);
    (screening.findOne as jest.Mock).mockResolvedValue(null);
    const result = await modifyScreening(1, { screeningDate: new Date('2025-10-31T10:00:00Z') });
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw error and rollback on modify screening if screening not found', async () => {
    (screening.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await modifyScreening(999, { screeningDate: new Date('2025-10-31T10:00:00Z') });
    expect(result.success).toBe(false);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error and rollback on modify screening if there are existing reservations', async () => {
    const mockScreeningInstance = {
      screeningId: 1,
      cinemaId: 1,
      roomId: 1,
      screeningDate: new Date('2025-10-29T10:00:00Z'),
      update: jest.fn(),
    };
    (screening.findByPk as jest.Mock).mockResolvedValue(mockScreeningInstance);
    (reservation.count as jest.Mock).mockResolvedValue(5);
    const result = await modifyScreening(1, { screeningDate: new Date('2025-10-31T10:00:00Z') });
    expect(result.success).toBe(false);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should delete screening successfully and update the screening status', async () => {
    const mockScreeningInstance = { update: jest.fn() };
    (screening.findByPk as jest.Mock).mockResolvedValue(mockScreeningInstance);
    (reservation.count as jest.Mock).mockResolvedValue(0);
    const result = await deleteScreening(1);
    expect(mockScreeningInstance.update).toHaveBeenCalledWith(
      {
        deletedAt: expect.any(Date),
        screeningStatus: 'deleted',
      },
      { transaction: mockTransaction },
    );
    expect(result.success).toBe(true);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw error and rollback on delete screening if the screening is not found', async () => {
    (screening.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await deleteScreening(999);
    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to delete screening');
    }
  });

  it('should throw error and rollback on delete screening if there is a reservation conflict', async () => {
    (screening.findByPk as jest.Mock).mockResolvedValue({ screeningId: 1 });
    (reservation.count as jest.Mock).mockResolvedValue(1);
    const result = await deleteScreening(1);
    expect(mockTransaction.rollback).toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Failed to delete screening');
    }
  });
});
