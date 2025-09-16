import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { logerror } from '../utils/logger';
import { clearAccessToken } from '../utils/tokenManagement';

export const logoutController = asyncHandler(logoutHandler);
export async function logoutHandler(req: Request, res: Response) {
  try {
    clearAccessToken(res);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    logerror('Logout error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred during logout',
        code: 'LOGOUT_ERROR',
      },
    };
  }
}
