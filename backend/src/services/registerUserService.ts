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
      userRole: newUserData.userRole as Role.CLIENT,
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

interface RegisteredEmployeeData {
  userId: number;
  userEmail: string;
}

// Register employee account (employee only)
export const registerEmployee = async (
  userData: userCreationAttributes,
): Promise<ServiceResponse<RegisteredEmployeeData>> => {
  try {
    // Check if email already exists
    const existingUser = await user.findOne({ where: { userEmail: userData.userEmail } });
    if (existingUser) {
      return errorResponse('Email already exists.', 'DUPLICATE_EMAIL_FORBIDDEN');
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.userPassword);
    userData.userPassword = hashedPassword;

    // Employees are verified by default
    userData.isVerified = true;

    // Create the user in the database
    const newUser = await user.create(userData, { returning: true });

    const newUserData = newUser.get({ plain: true }) as RegisteredEmployeeData;
    // Prepare the response data
    const responseData: RegisteredEmployeeData = {
      userId: newUserData.userId,
      userEmail: newUserData.userEmail,
    };
    // If user creation failed
    if (!newUserData) {
      return errorResponse('Employee not found.', 'EMPLOYEE_NOT_FOUND');
    }
    // Return success response
    return successResponse(responseData);
    // If any error occurs during the process
  } catch (error) {
    logerror('Error registering employee:', error);
    return errorResponse('Employee registration failed', 'REGISTRATION_ERROR');
  }
};

// Define the structure data to be returned after password reset
interface ResetPasswordData {
  userEmail: string;
}

// Reset the user password
export const resetPassword = async (
  userId: number,
  newPassword: string,
): Promise<ServiceResponse<ResetPasswordData>> => {
  try {
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the employee's password in the database; updated at will be handled automatically
    const passwordUpdated = await user.update(
      { userPassword: hashedPassword, userUpdatedAt: new Date() },
      { where: { userId } },
    );
    if (passwordUpdated[0] === 0) {
      return errorResponse('User not found or password not changed.', 'USER_NOT_FOUND');
    }

    // Fetch the updated user to get the email
    const updatedUser = await user.findOne({
      where: { userId },
      attributes: ['userEmail'],
    });
    if (!updatedUser) {
      return errorResponse('User not found after update.', 'USER_NOT_FOUND');
    }
    // Prepare the response data
    const updatedUserData = updatedUser.get({ plain: true }) as ResetPasswordData;
    const responseData: ResetPasswordData = {
      userEmail: updatedUserData.userEmail,
    };

    // Return success response
    return successResponse(responseData);
  } catch (error) {
    logerror('Error resetting user password:', error);
    return errorResponse('Password reset failed', 'PASSWORD_RESET_ERROR');
  }
};
