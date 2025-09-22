import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { sanitizeLoginInput } from '../utils/sanitize';
import { validateLoginInput } from '../validators/userValidator';
import { user } from '../models/init-models';
import { comparePasswords } from '../utils/userPassword';
import type { Role } from '../validators/userValidator';
import { logerror } from '../utils/logger';
import { attachAccessToken, generateAccessToken } from '../utils/tokenManagement';

export const loginClientController = asyncHandler(loginClientHandler);
export async function loginClientHandler(req: Request, res: Response) {
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
    const clientId = userToLogin.get('userId');
    const clientPassword = userToLogin.get('userPassword');
    const clientRole = userToLogin.get('userRole') as Role;
    const clientVerified = userToLogin.get('isVerified');

    // Check if the user is verified
    if (clientRole !== 'client') {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    // Check if the user is verified
    if (!clientVerified) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    // Compare passwords
    const isMatching = await comparePasswords(validatedData.userPassword, clientPassword);
    if (!isMatching) {
      return errorResponse('Invalid email or password', 'UNAUTHORIZED');
    }

    // Generate access token
    const accessToken = generateAccessToken(clientId, clientRole);
    if (!accessToken) {
      return errorResponse('Token failure', 'INTERNAL_SERVER_ERROR');
    }

    // Attach access token to response
    if (accessToken) {
      attachAccessToken(res, accessToken);
    }
    // Return success response with access token
    return {
      success: true,
      data: {
        userRole: clientRole,
      },
    };
  } catch (error) {
    logerror('Login error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred during login',
        code: 'LOGIN_ERROR',
      },
    };
  }
}
