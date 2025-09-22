import {
  hashPassword,
  generateVerificationCode,
  generateVerificationCodeExpires,
} from '../utils/userPassword';
import { user, userCreationAttributes } from '../models/init-models';
import { ServiceResponse, successResponse, errorResponse } from '../interfaces/serviceResponse';
import { Role } from '../validators/userValidator';
import { logerror } from '../utils/logger';

interface RegisteredUserData {
  userId: number;
  userRole: string;
  isVerified: boolean;
  userEmail: string;
  userFirstName: string;
  verificationCode?: string;
}

export const registerUser = async (
  userData: userCreationAttributes,
): Promise<ServiceResponse<RegisteredUserData>> => {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(userData.userPassword);
    userData.userPassword = hashedPassword;

    // Generate verification code and expiration
    userData.verificationCode = generateVerificationCode();
    userData.verificationCodeExpires = generateVerificationCodeExpires();

    // Create the user in the database
    const newUser = await user.create(userData, { returning: true });

    const newUserData = newUser.get({ plain: true }) as RegisteredUserData;
    // Prepare the response data
    const responseData: RegisteredUserData = {
      userId: newUserData.userId,
      userRole: newUserData.userRole as Role,
      isVerified: !!newUserData.isVerified,
      userEmail: newUserData.userEmail,
      userFirstName: newUserData.userFirstName,
      verificationCode: newUserData.verificationCode,
    };
    // If user creation failed
    if (!newUserData) {
      return errorResponse('User not found.', 'USER_NOT_FOUND');
    }
    // Return success response
    return successResponse(responseData);
    // If any error occurs during the process
  } catch (error) {
    logerror('Error registering user:', error);
    return errorResponse('Registration failed', 'REGISTRATION_ERROR');
  }
};
