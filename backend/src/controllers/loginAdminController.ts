import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { sanitizeLoginInput } from '../utils/sanitize';
import { validateLoginInput } from '../validators/userValidator';
import { user } from '../models/init-models';
import { comparePasswords } from '../utils/userPassword';
import { generateAccessToken } from '../utils/tokenManagement';
import type { Role } from '../validators/userValidator';
import { logerror } from '../utils/logger';

export const loginAdminController = asyncHandler(loginAdminHandler);

export async function loginAdminHandler(req: Request) {
  try {
    const { userEmail, userPassword } = req.body;
    // Check if all required fields are provided
    if (!userEmail || !userPassword) {
      return errorResponse('All fields are required', 'BAD_REQUEST');
    }
    // Validate input
    const sanitized = sanitizeLoginInput(req.body);
    const validatedData = await validateLoginInput(sanitized);

    // Check user credentials
    const userToLogin = await user.findOne({
      where: { userEmail: validatedData.userEmail },
      attributes: ['userId', 'userPassword', 'userRole', 'isVerified'],
    });
    if (!userToLogin) {
      return errorResponse('Invalid credentials', 'UNAUTHORIZED');
    }

    // DataValues is used to get the raw data from Sequelize model instance
    const adminId = userToLogin.get('userId');
    const adminPassword = userToLogin.get('userPassword');
    const adminRole = userToLogin.get('userRole') as Role;
    const adminVerified = userToLogin.get('isVerified');

    // Check if the user is verified
    if (adminRole !== 'admin') {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    // Check if the user is verified
    if (!adminVerified) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    // Compare passwords
    const isMatching = await comparePasswords(validatedData.userPassword, adminPassword);
    if (!isMatching) {
      return errorResponse('Invalid email or password', 'UNAUTHORIZED');
    }

    // Generate access token
    const accessToken = generateAccessToken(adminId, adminRole);
    if (!accessToken) {
      return errorResponse('Token failure', 'INTERNAL_SERVER_ERROR');
    }

    // Return success response with access token
    return {
      success: true,
      data: {
        accessToken: accessToken,
        userRole: adminRole,
      },
    };
  } catch (error) {
    logerror('Error during admin login:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred during login',
        code: 'LOGIN_ERROR',
      },
    };
  }
}
