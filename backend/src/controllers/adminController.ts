import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { Role } from '../validators/userValidator';
import { logerror } from '../utils/logger';
import * as adminDashboardService from '../services/adminDashboardService';

export const adminReservationsController = asyncHandler(adminReservationsHandler);
// Function to handle admin reservation stats requests
export async function adminReservationsHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || !req.user.userId) {
      return errorResponse('User not authenticated', 'UNAUTHORIZED');
    }
    if (req.user.userRole !== Role.ADMIN) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }

    // Call the admin dashboard service to get reservation stats
    const response = await adminDashboardService.getReservationStats();
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    const reservationStats = response.data;
    return {
      success: true,
      data: reservationStats,
    };
  } catch (error) {
    logerror('Error handling admin reservations:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}
