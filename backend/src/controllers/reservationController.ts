import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { isScreeningActive } from '../utils/screeningUpdate';
import * as reservationService from '../services/reservationService';
import { ReservationService } from '../services/reservationService';
import { logerror } from '../utils/logger';

export const seatingController = asyncHandler(seatingHandler);
export const reservingController = asyncHandler(reservingHandler);
export const reservationsController = asyncHandler(reservationsHandler);

// Function to handle seating requests
export async function seatingHandler(req: Request) {
  try {
    // Ensure the request body contains screeningId as a number
    const screeningId = parseInt(req.params.id, 10);
    // Validate screeningId
    if (!screeningId && isNaN(screeningId)) {
      return errorResponse('Screening ID is required', 'BAD_REQUEST');
    }
    // Validate screeningId to ensure whole number
    if (!Number.isInteger(screeningId) || screeningId <= 0) {
      return errorResponse('Invalid Screening ID', 'BAD_REQUEST');
    }

    // Check if the screening is active
    const screeningCheck = await isScreeningActive(screeningId);
    if (!screeningCheck.success) {
      return errorResponse(screeningCheck.error.message, screeningCheck.error.code);
    }

    // Call for the seats of a specified screening
    const response = await reservationService.getSeatsForScreening(screeningId);
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    const seats = response.data;
    return {
      success: true,
      data: seats,
    };
  } catch (error) {
    logerror('Error handling reservation:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}

// Function to handle reservation requests
export async function reservingHandler(req: Request) {
  try {
    const { screeningId, seatIds } = req.body;
    if (!req.user || !req.user.userId) {
      return errorResponse('User not authenticated', 'UNAUTHORIZED');
    }
    const userId = req.user.userId;

    // Validate request body
    if ((!screeningId && isNaN(screeningId)) || !Array.isArray(seatIds) || seatIds.length === 0) {
      return errorResponse('Invalid request data', 'BAD_REQUEST');
    }
    for (const seatId of seatIds) {
      if (!Number.isInteger(seatId) || seatId <= 0) {
        return errorResponse('Invalid Seat ID', 'BAD_REQUEST');
      }
    }
    // Validate screeningId to ensure whole number
    if (!Number.isInteger(screeningId) || screeningId <= 0) {
      return errorResponse('Invalid Screening ID', 'BAD_REQUEST');
    }

    // Check if the screening is active
    const screeningCheck = await isScreeningActive(screeningId);
    if (!screeningCheck.success) {
      return errorResponse(screeningCheck.error.message, screeningCheck.error.code);
    }

    // Call the reservation service to reserve seats
    const response = await ReservationService.makeReservation(userId, screeningId, seatIds);
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    return {
      success: true,
      message: 'Reservation successful',
    };
  } catch (error) {
    logerror('Error handling reservation:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}

// Function to retrieve client reservations
export async function reservationsHandler(req: Request) {
  try {
    if (!req.user || !req.user.userId) {
      return errorResponse('User not authenticated', 'UNAUTHORIZED');
    }
    const userId = req.user.userId;

    // Call the reservation service to get user reservations
    const response = await reservationService.getUserReservations(userId);
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    const reservations = response.data;
    return {
      success: true,
      data: reservations,
    };
  } catch (error) {
    logerror('Error handling reservations:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}
