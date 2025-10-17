import {
  film,
  filmAttributes,
  genreFilm,
  genre,
  room,
  roomAttributes,
  cinema,
  quality,
  seat,
  screening,
  screeningAttributes,
  reservationSeat,
  reservation,
} from '../models/init-models';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';
import { sequelize } from '../config/databaseSql';
import { Op, Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { logerror } from '../utils/logger';

// --- CRUD FIlM OPERATIONS ---
// Function to create a new film with associated genres
export async function createFilm(
  filmData: filmAttributes,
  genreIds: number[],
): Promise<ServiceResponse<film>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if film with the same title already exists
    const existingFilm = await film.findOne({
      where: { filmTitle: filmData.filmTitle },
      transaction,
    });
    if (existingFilm) {
      throw new Error('Film with this title already exists');
    }

    // Check the genre exists
    const existingGenres = await genre.findAll({
      where: { genreId: { [Op.in]: genreIds } },
      transaction,
    });
    if (existingGenres.length !== genreIds.length) {
      throw new Error('One or more genres do not exist');
    }

    const newFilm = await film.create(filmData, { transaction });
    // Add genres via the join table if setGenres is not available
    await genreFilm.bulkCreate(
      genreIds.map(genreId => ({
        filmId: newFilm.filmId,
        genreId: genreId,
      })),
      { transaction },
    );
    // Commit the transaction
    await transaction.commit();

    return successResponse(newFilm);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to create film', 'FILM_CREATION_ERROR');
  }
}

// Type for film with associated genres
type filmWithGenres = film & { genres: genre[] };

// Function to list/read the films
export async function listFilms(): Promise<ServiceResponse<filmWithGenres[]>> {
  try {
    const films = await film.findAll({
      where: { filmPublishingState: 'active' },
      include: [
        {
          model: genreFilm,
          as: 'genreFilms',
          include: [{ model: genre, as: 'genre' }],
        },
      ],
      order: [['filmTitle', 'ASC']],
    });
    // Map to include genres directly in the film object
    const formattedFilms: filmWithGenres[] = films.map(f => {
      const filmInstance = f as film;
      return Object.assign(filmInstance, {
        genres: f.genreFilms ? f.genreFilms.map(gf => gf.genre) : [],
      });
    });

    return successResponse(formattedFilms);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to list films', 'FILM_LISTING_ERROR');
  }
}

// Function to modify an existing film and its associated genres
export async function modifyFilm(
  filmId: number,
  filmData: filmAttributes,
  genreIds: number[],
): Promise<ServiceResponse<film>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if film exists
    const existingFilm = await film.findByPk(filmId, { transaction });
    if (!existingFilm) {
      throw new Error('Film not found');
    }
    // Update film details
    await existingFilm.update(filmData, { transaction });

    // Update genres if provided
    if (genreIds && genreIds.length > 0) {
      // Check the genre exists
      const existingGenres = await genre.findAll({
        where: { genreId: { [Op.in]: genreIds } },
        transaction,
      });
      if (existingGenres.length !== genreIds.length) {
        throw new Error('One or more genres do not exist');
      }
      // Remove any genres that are no longer associated with the film
      await genreFilm.destroy({
        where: { filmId: filmId },
        transaction,
      });
      // Add the new set of genres
      await genreFilm.bulkCreate(
        genreIds.map(genreId => ({
          filmId: filmId,
          genreId: genreId,
        })),
        { transaction },
      );
    }

    // Commit the transaction
    await transaction.commit();

    return successResponse(existingFilm);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to modify film', 'FILM_MODIFICATION_ERROR');
  }
}

// Function to remove a film by marking it as inactive (preserving data integrity)
export async function deleteFilm(filmId: number): Promise<ServiceResponse<film>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if film exists
    const existingFilm = await film.findByPk(filmId, { transaction });
    if (!existingFilm) {
      throw new Error('Film not found');
    }
    // Update the publishing state to inactive
    await existingFilm.update({ filmPublishingState: 'inactive' }, { transaction });

    await transaction.commit();
    return successResponse(existingFilm);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to remove film', 'FILM_REMOVAL_ERROR');
  }
}

// -- CRUD ROOM OPERATIONS ---
// Function to create a new room for a specified cinema
export async function createRoom(
  roomData: roomAttributes,
  numRows: number,
  seatsPerRow: number,
): Promise<ServiceResponse<room>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if cinema exists
    const existingCinema = await cinema.findByPk(roomData.cinemaId, {
      transaction,
    });
    if (!existingCinema) {
      throw new Error('Cinema not found');
    }
    // Check if quality exists
    const existingQuality = await quality.findByPk(roomData.qualityId, { transaction });
    if (!existingQuality) {
      throw new Error('Quality not found');
    }

    // Check if room with the same number already exists in the cinema that isn't deleted
    const existingRoom = await room.findOne({
      where: {
        roomNumber: roomData.roomNumber,
        cinemaId: roomData.cinemaId,
        deletedAt: { [Op.eq]: null },
      },
      transaction,
      paranoid: true,
    });
    if (existingRoom) {
      throw new Error('Room already exists');
    }

    // Calculate total capacity and generate seat map ID
    const totalCapacity = numRows * seatsPerRow;
    const seatMapId = uuidv4();

    // Create the room
    const newRoom = await room.create(
      {
        ...roomData,
        roomCapacity: totalCapacity,
        seatMapId: seatMapId,
      },
      { transaction },
    );

    // Create the seats
    const seatEntries = [];
    for (let row = 0; row < numRows; row++) {
      const seatRow = String.fromCharCode(65 + row);
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        seatEntries.push({
          seatRow: seatRow,
          seatNumber: seatNum,
          roomId: newRoom.roomId,
        });
      }
    }
    // Create the seats in bulk
    await seat.bulkCreate(seatEntries, { transaction });

    // Commit the transaction
    await transaction.commit();

    return successResponse(newRoom);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to create room', 'ROOM_CREATION_ERROR');
  }
}

// List all rooms and quality details for selected cinema
export async function listRooms(cinemaId: number): Promise<ServiceResponse<room[]>> {
  try {
    const rooms = await room.findAll({
      where: { cinemaId: cinemaId, deletedAt: { [Op.is]: null } },
      attributes: { exclude: ['deletedAt', 'seatMapId'] },
      include: [
        { model: quality, as: 'quality', attributes: ['qualityProjectionType'] },
        { model: cinema, as: 'cinema', attributes: ['cinemaName'] },
      ],
      order: [['roomNumber', 'ASC']],
    });

    return successResponse(rooms);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to list rooms', 'ROOM_LISTING_ERROR');
  }
}

// Update room details (room number and quality)
export async function modifyRoom(
  roomId: number,
  roomData: roomAttributes,
  numRows: number,
  seatsPerRow: number,
): Promise<ServiceResponse<room>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if room exists
    const existingRoom = await room.findOne({
      where: { roomId: roomId, deletedAt: { [Op.is]: null } },
      transaction,
    });
    if (!existingRoom) {
      throw new Error('Room not found');
    }

    // Check cinema and quality if they are being updated
    if (roomData.cinemaId && roomData.cinemaId !== existingRoom.cinemaId) {
      const existingCinema = await cinema.findByPk(roomData.cinemaId, { transaction });
      if (!existingCinema) {
        throw new Error('Cinema not found');
      }
    }
    if (roomData.qualityId && roomData.qualityId !== existingRoom.qualityId) {
      const existingQuality = await quality.findByPk(roomData.qualityId, { transaction });
      if (!existingQuality) {
        throw new Error('Quality not found');
      }
    }

    // Check if there are reservations associated with the room
    const reservations = await reservationSeat.count({
      include: [
        {
          model: seat,
          as: 'seat',
          where: { roomId: roomId },
        },
      ],
      transaction,
    });
    if (reservations > 0) {
      throw new Error('Room has existing reservations');
    }
    // Update room details
    await existingRoom.update(roomData, { transaction });
    // Update seat map if rows or seats per row have changed
    if (numRows > 0 && seatsPerRow > 0) {
      // Recalculate total capacity and update seat map ID if capacity has changed
      const newTotalCapacity = numRows * seatsPerRow;
      if (newTotalCapacity !== existingRoom.roomCapacity) {
        const newSeatMapId = uuidv4();
        await existingRoom.update(
          { seatMapId: newSeatMapId, roomCapacity: newTotalCapacity },
          { transaction },
        );
      }
      // Destroy seats that are associated with the room and not reserved
      await seat.destroy({ where: { roomId }, transaction });
      // Create the seats
      const seatEntries = [];
      for (let row = 0; row < numRows; row++) {
        const seatRow = String.fromCharCode(65 + row);
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          seatEntries.push({
            seatRow: seatRow,
            seatNumber: seatNum,
            roomId: roomId,
          });
        }
      }
      await seat.bulkCreate(seatEntries, { transaction });
    }
    // Commit the transaction
    await transaction.commit();

    return successResponse(existingRoom);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to modify room', 'ROOM_MODIFICATION_ERROR');
  }
}

// Soft delete a room by marking it as deleted
export async function deleteRoom(roomId: number): Promise<ServiceResponse<room>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if room exists
    const existingRoom = await room.findByPk(roomId, { transaction });
    if (!existingRoom) {
      throw new Error('Room not found');
    }
    // Soft delete the room
    await existingRoom.update({ deletedAt: new Date() }, { transaction });
    // Commit the transaction
    await transaction.commit();

    return successResponse(existingRoom);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to delete room', 'ROOM_DELETION_ERROR');
  }
}

// --- CRUD SCREENING OPERATIONS ---
// Function to create a screening for a specified film
export async function createScreening(
  screeningData: screeningAttributes,
): Promise<ServiceResponse<screening>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const { cinemaId, roomId, filmId, screeningDate } = screeningData;
    // Check if cinema exists
    const existingCinema = await cinema.findByPk(cinemaId, { transaction });
    if (!existingCinema) {
      throw new Error('Cinema not found');
    }
    // Check if room exists
    const existingRoom = await room.findByPk(roomId, { transaction });
    if (!existingRoom) {
      throw new Error('Room not found');
    }
    // Check if film exists
    const existingFilm = await film.findByPk(filmId, { transaction });
    if (!existingFilm) {
      throw new Error('Film not found');
    }
    // Check for scheduling conflicts
    const conflictingScreening = await screening.findOne({
      where: {
        cinemaId: cinemaId,
        roomId: roomId,
        screeningDate: screeningDate,
      },
      transaction,
    });
    if (conflictingScreening) {
      throw new Error('Scheduling conflict: Screening exists already at this date and time');
    }
    // Create the screening
    const newScreening = await screening.create(screeningData, { transaction });
    // Commit the transaction
    await transaction.commit();

    return successResponse(newScreening);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to create screening', 'SCREENING_CREATION_ERROR');
  }
}

// For a selected cinema, room, list all screenings with film details
export async function listScreenings(
  cinemaId: number,
  roomId: number,
  filmId: number,
): Promise<ServiceResponse<screening[]>> {
  try {
    // Build the filter object as film is optional
    const filter: Record<string, unknown> = {
      cinemaId: cinemaId,
      roomId: roomId,
      deletedAt: { [Op.is]: null },
      screeningStatus: 'active',
    };
    if (filmId !== 0) {
      filter.filmId = filmId;
    }
    // Fetch screenings
    const screenings = await screening.findAll({
      where: filter,
      attributes: { exclude: ['deletedAt'] },
      include: [
        { model: film, as: 'film', attributes: ['filmTitle'] },
        { model: room, as: 'room', attributes: ['roomNumber'] },
        { model: cinema, as: 'cinema', attributes: ['cinemaName'] },
      ],
      order: [['screeningDate', 'ASC']],
    });

    return successResponse(screenings);
  } catch (err) {
    logerror(err);
    return errorResponse('Failed to list screenings', 'SCREENING_LIST_ERROR');
  }
}

// Modify the screening details
export async function modifyScreening(
  screeningId: number,
  screeningData: Partial<screeningAttributes>,
): Promise<ServiceResponse<screening>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if screening exists
    const existingScreening = await screening.findByPk(screeningId, { transaction });
    if (!existingScreening) {
      throw new Error('Screening not found');
    }
    // Cinema and room are always included as modifications are for the screeningDate only
    if (
      (screeningData.cinemaId && screeningData.cinemaId !== existingScreening.cinemaId) ||
      (screeningData.roomId && screeningData.roomId !== existingScreening.roomId) ||
      (screeningData.screeningDate &&
        screeningData.screeningDate !== existingScreening.screeningDate)
    ) {
      // Check for scheduling conflicts
      const conflictingScreening = await screening.findOne({
        where: {
          cinemaId: screeningData.cinemaId || existingScreening.cinemaId,
          roomId: screeningData.roomId || existingScreening.roomId,
          screeningDate: screeningData.screeningDate || existingScreening.screeningDate,
          screeningId: { [Op.ne]: screeningId }, // Exclude the current screening
        },
        transaction,
      });
      if (conflictingScreening) {
        throw new Error('Scheduling conflict: Screening exists already at this date and time');
      }
    }
    // Check for existing reservations excluding all other attributes
    const reservations = await reservation.count({
      where: { screeningId: screeningId },
      transaction,
    });
    if (reservations > 0) {
      throw new Error('Cannot modify screening with existing reservations');
    }
    // Update the screening
    await existingScreening.update({ screeningDate: screeningData.screeningDate }, { transaction });
    // Commit the transaction
    await transaction.commit();

    return successResponse(existingScreening);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to modify screening', 'SCREENING_MODIFICATION_ERROR');
  }
}

// Soft delete a screening by marking it as deleted
export async function deleteScreening(screeningId: number): Promise<ServiceResponse<screening>> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Check if screening exists
    const existingScreening = await screening.findByPk(screeningId, { transaction });
    if (!existingScreening) {
      throw new Error('Screening not found');
    }
    // Check for existing reservations excluding all other attributes
    const reservations = await reservation.count({
      where: { screeningId: screeningId },
      transaction,
    });
    if (reservations > 0) {
      throw new Error('Cannot delete screening with existing reservations');
    }
    // Soft delete the screening
    await existingScreening.update(
      { deletedAt: new Date(), screeningStatus: 'deleted' },
      { transaction },
    );
    // Commit the transaction
    await transaction.commit();

    return successResponse(existingScreening);
  } catch (err) {
    await transaction.rollback();
    logerror(err);
    return errorResponse('Failed to delete screening', 'SCREENING_DELETION_ERROR');
  }
}
