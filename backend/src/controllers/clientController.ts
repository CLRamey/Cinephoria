import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { Role } from '../validators/userValidator';

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
export async function clientProfileHandler(req: Request) {
  try {
    const user = req.user; // Assuming req.user is set by auth middleware
    if (!user || !user.userId || !user.userRole) {
      return {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      };
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
    console.error('Error fetching client profile:', error);
    return {
      success: false,
      error: {
        message: 'Failed to fetch client profile',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}
export const clientProfileController = asyncHandler(clientProfileHandler);
