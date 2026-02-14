import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { Role, validateFilmInput } from '../validators/userValidator';
import { logerror } from '../utils/logger';
import * as crudService from '../services/crudService';
import { sanitizeFilmInput } from '../utils/sanitize';
import { isPositiveNumber, isNonNegativeNumber, isFutureDate } from '../validators/userValidator';

// -- CRUD FILM OPERATIONS --
// Create a new film
export const createFilmController = asyncHandler(createFilmHandler);
export async function createFilmHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    let { filmData, genreIds } = req.body;
    //Ensure all film attributes are present for film creation
    const requiredAttributes = [
      'filmTitle',
      'filmDescription',
      'filmImg',
      'filmDuration',
      'filmFavorite',
      'filmMinimumAge',
      'filmActiveDate',
    ];
    for (const attr of requiredAttributes) {
      if (filmData[attr] === undefined || filmData[attr] === null) {
        return errorResponse(`Missing film attribute`, 'BAD_REQUEST');
      }
    }
    if (!Array.isArray(genreIds) || genreIds.length === 0) {
      return errorResponse('At least one genre ID must be provided', 'BAD_REQUEST');
    }
    if (genreIds.some(id => !isPositiveNumber(id))) {
      return errorResponse('Genre IDs must be positive integers', 'BAD_REQUEST');
    }
    // Normalize genre IDs to numbers
    genreIds = genreIds.map((id: number) => Number(id));
    // Sanitize and validate film input
    filmData = sanitizeFilmInput(filmData);
    validateFilmInput(filmData);
    // Call the service to create the film
    const response = await crudService.createFilm(filmData, genreIds);

    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// List all films with associated genres
export const listFilmsController = asyncHandler(listFilmsHandler);
export async function listFilmsHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Call the service to list films
    const response = await crudService.listFilms();
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Modify an existing film
export const modifyFilmController = asyncHandler(modifyFilmHandler);
export async function modifyFilmHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { filmId } = req.params;
    let { filmData, genreIds } = req.body;
    // Ensure all film attributes are present for film modification
    const requiredAttributes = [
      'filmTitle',
      'filmDescription',
      'filmImg',
      'filmDuration',
      'filmFavorite',
      'filmMinimumAge',
      'filmActiveDate',
    ];
    for (const attr of requiredAttributes) {
      if (filmData[attr] === undefined || filmData[attr] === null) {
        return errorResponse(`Missing film attribute`, 'BAD_REQUEST');
      }
    }
    if (!filmId || !isPositiveNumber(filmId)) {
      return errorResponse('Invalid film ID', 'BAD_REQUEST');
    }
    if (!Array.isArray(genreIds) || genreIds.length === 0) {
      return errorResponse('At least one genre ID must be provided', 'BAD_REQUEST');
    }
    // Normalize genre IDs to numbers
    genreIds = genreIds.map((genreId: number) => Number(genreId));
    if (genreIds.some((genreId: number) => !isPositiveNumber(genreId))) {
      return errorResponse('Genre IDs must be positive integers', 'BAD_REQUEST');
    }

    // Sanitize and validate film input
    const sanitizeFilmData = sanitizeFilmInput(filmData);
    filmData = validateFilmInput(sanitizeFilmData);
    // Call the service to modify the film
    const response = await crudService.modifyFilm(Number(filmId), filmData, genreIds);
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Soft-delete (mark as inactive) a film
export const deleteFilmController = asyncHandler(deleteFilmHandler);
export async function deleteFilmHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { filmId } = req.params;
    // Validate film ID
    const filmIdToDelete = Number(filmId);
    if (!filmIdToDelete || !isPositiveNumber(filmIdToDelete)) {
      return errorResponse('Invalid film ID', 'BAD_REQUEST');
    }
    // Call the service to delete the film
    const response = await crudService.deleteFilm(Number(filmId));
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// -- CRUD ROOM OPERATIONS --
// Create a new room
export const createRoomController = asyncHandler(createRoomHandler);
export async function createRoomHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Extract and validate room data
    const { roomData, numRows, seatsPerRow } = req.body;
    if (!roomData || !numRows || !seatsPerRow) {
      return errorResponse('Missing required room data or seating info', 'BAD_REQUEST');
    }
    // Ensure all room attributes are present for room creation
    const requiredAttributes = ['roomNumber', 'qualityId', 'cinemaId'];
    for (const attr of requiredAttributes) {
      if (!roomData[attr]) {
        return errorResponse(`Missing room attribute`, 'BAD_REQUEST');
      }
    }
    // Validate room attributes
    if (
      !isPositiveNumber(roomData.roomNumber) ||
      !isPositiveNumber(roomData.qualityId) ||
      !isPositiveNumber(roomData.cinemaId)
    ) {
      return errorResponse('Room attributes must be positive integers', 'BAD_REQUEST');
    }
    // Validate seating input
    if (!isPositiveNumber(numRows) || !isPositiveNumber(seatsPerRow)) {
      return errorResponse('Rows and seats per row must be positive integers', 'BAD_REQUEST');
    }
    // Call the service to create the room
    const response = await crudService.createRoom(roomData, numRows, seatsPerRow);
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// List all rooms for a cinema
export const listRoomsController = asyncHandler(listRoomsHandler);
export async function listRoomsHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Validate cinema ID
    const { cinemaId } = req.params;
    if (!cinemaId || !isPositiveNumber(cinemaId)) {
      return errorResponse('Invalid cinema ID', 'BAD_REQUEST');
    }

    const response = await crudService.listRooms(Number(cinemaId));
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Modify an existing room
export const modifyRoomController = asyncHandler(modifyRoomHandler);
export async function modifyRoomHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { roomId } = req.params;
    const { roomData, numRows, seatsPerRow } = req.body;
    // Validate room ID
    if (!roomId || !isPositiveNumber(roomId)) {
      return errorResponse('Invalid room ID', 'BAD_REQUEST');
    }
    if (!roomData || numRows === null || seatsPerRow === null) {
      return errorResponse('Missing required room data or seating info', 'BAD_REQUEST');
    }
    // Ensure all room attributes are present for room modification
    const requiredAttributes = ['qualityId', 'cinemaId'];
    for (const attr of requiredAttributes) {
      if (!roomData[attr]) {
        return errorResponse(`Missing room attribute`, 'BAD_REQUEST');
      }
    }
    // Validate room attributes
    if (!isPositiveNumber(roomData.qualityId) || !isPositiveNumber(roomData.cinemaId)) {
      return errorResponse('Room attributes must be positive integers', 'BAD_REQUEST');
    }
    // Validate seating attributes
    if (isNaN(numRows) || numRows < 0 || isNaN(seatsPerRow) || seatsPerRow < 0) {
      return errorResponse('Rows and seats per row must be included', 'BAD_REQUEST');
    }
    // Call the service to modify the room
    const response = await crudService.modifyRoom(Number(roomId), roomData, numRows, seatsPerRow);
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Soft-delete a room
export const deleteRoomController = asyncHandler(deleteRoomHandler);
export async function deleteRoomHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { roomId } = req.params;
    if (!roomId || !isPositiveNumber(roomId)) {
      return errorResponse('Invalid room ID', 'BAD_REQUEST');
    }
    // Call the service to delete the room
    const response = await crudService.deleteRoom(Number(roomId));
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// -- CRUD SCREENING OPERATIONS --
// Create a new screening
export const createScreeningController = asyncHandler(createScreeningHandler);
export async function createScreeningHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }

    const { screeningData } = req.body;
    // Validate required fields
    const requiredAttributes = ['cinemaId', 'roomId', 'filmId', 'screeningDate'];

    for (const attr of requiredAttributes) {
      if (!screeningData[attr]) {
        return errorResponse(`Missing screening attributes`, 'BAD_REQUEST');
      }
    }
    // Validate numeric IDs
    if (
      !isPositiveNumber(screeningData.cinemaId) ||
      !isPositiveNumber(screeningData.roomId) ||
      !isPositiveNumber(screeningData.filmId)
    ) {
      return errorResponse('Cinema, Room, and Film IDs must be positive integers', 'BAD_REQUEST');
    }
    // Validate screening date/time in future
    if (!screeningData.screeningDate || !isFutureDate(screeningData.screeningDate)) {
      return errorResponse('Screening date must be a valid future date and time', 'BAD_REQUEST');
    }
    // Call the service to create the screening
    const response = await crudService.createScreening(screeningData);

    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// List screenings for a cinema and room (optional film filter)
export const listScreeningsController = asyncHandler(listScreeningsHandler);
export async function listScreeningsHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { cinemaId, roomId, filmId } = req.params;
    // Validate cinema and room IDs
    if (!isPositiveNumber(cinemaId) || !isPositiveNumber(roomId) || filmId === undefined) {
      return errorResponse('Cinema and Room IDs must be positive integers', 'BAD_REQUEST');
    }
    // Validate optional film ID
    if (!isNonNegativeNumber(filmId)) {
      return errorResponse('Film ID must be a positive integer', 'BAD_REQUEST');
    }
    // Call the service to list screenings
    const response = await crudService.listScreenings(
      Number(cinemaId),
      Number(roomId),
      Number(filmId),
    );
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Modify an existing screening (full replace recommended)
export const modifyScreeningController = asyncHandler(modifyScreeningHandler);
export async function modifyScreeningHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { screeningId } = req.params;
    const { screeningData } = req.body;
    if (!screeningData) {
      return errorResponse('Missing screening data', 'BAD_REQUEST');
    }
    // Validate screening ID
    if (!screeningId || !isPositiveNumber(screeningId)) {
      return errorResponse('Invalid screening ID', 'BAD_REQUEST');
    }
    // Validate required fields (full replace)
    const requiredAttributes = ['cinemaId', 'roomId', 'filmId', 'screeningDate'];
    for (const attr of requiredAttributes) {
      if (!screeningData[attr]) {
        return errorResponse(`Missing screening attributes`, 'BAD_REQUEST');
      }
    }
    if (
      !isPositiveNumber(screeningData.cinemaId) ||
      !isPositiveNumber(screeningData.roomId) ||
      !isPositiveNumber(screeningData.filmId)
    ) {
      return errorResponse('Cinema, Room, and Film IDs must be positive integers', 'BAD_REQUEST');
    }
    if (!screeningData.screeningDate || !isFutureDate(screeningData.screeningDate)) {
      return errorResponse('Screening date must be a valid future date and time', 'BAD_REQUEST');
    }
    const response = await crudService.modifyScreening(Number(screeningId), screeningData);
    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

// Soft delete a screening
export const deleteScreeningController = asyncHandler(deleteScreeningHandler);
export async function deleteScreeningHandler(req: Request) {
  try {
    if (!req.user || (req.user.userRole !== Role.ADMIN && req.user.userRole !== Role.EMPLOYEE)) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }

    const { screeningId } = req.params;
    if (!screeningId || !isPositiveNumber(screeningId)) {
      return errorResponse('Invalid screening ID', 'BAD_REQUEST');
    }
    // Call the service to delete the screening
    const response = await crudService.deleteScreening(Number(screeningId));

    if (!response.success) return errorResponse(response.error.message, response.error.code);
    return { success: true, data: response.data };
  } catch (err) {
    logerror(err);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}
