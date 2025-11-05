import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { Role } from '../validators/userValidator';
import { logerror } from '../utils/logger';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      userRole: Role;
    };
  }
}

// Check the token and return client profile information.
export const clientProfileController = asyncHandler(clientProfileHandler);
export async function clientProfileHandler(req: Request) {
  try {
    // Double check authentication and authorization
    const user = req.user; // Assuming req.user is set by auth middleware
    if (!user || !user.userId || !user.userRole || user.userRole !== Role.CLIENT) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Return the user profile information
    return {
      success: true,
      data: {
        userId: user.userId,
        userRole: user.userRole,
      },
    };
  } catch (error) {
    logerror('Error fetching client profile:', error);
    return {
      success: false,
      error: {
        message: 'Failed to fetch client profile',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}
