import { Request } from 'express';
import { registerUser } from '../services/registerUserService';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validateRegisterInput } from '../validators/userValidator';
import { sendVerificationEmail } from '../utils/verificationEmail';
import { errorResponse } from '../interfaces/serviceResponse';
import { user } from '../models/init-models';

export const registerUserController = asyncHandler(registerUserHandler);
export const verifyEmailController = asyncHandler(verifyEmailHandler);

export async function registerUserHandler(req: Request) {
  try {
    const {
      userFirstName,
      userLastName,
      userUsername,
      userEmail,
      userPassword,
      agreedPolicy,
      agreedCgvCgu,
    } = req.body;
    if (
      !userFirstName ||
      !userLastName ||
      !userUsername ||
      !userEmail ||
      !userPassword ||
      !agreedPolicy ||
      !agreedCgvCgu
    ) {
      return errorResponse('All fields are required', 'BAD_REQUEST');
    }
    // 1. Validate input
    const validatedData = await validateRegisterInput(req.body);

    // 2. Create user in DB
    const response = await registerUser(validatedData);
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          message: 'Registration failed',
          code: 'REGISTRATION_ERROR',
        },
      };
    }

    // 3. Check the newUser creation and create the verification code
    const newUser = response.data;
    if (!newUser) {
      return errorResponse('User creation failed', 'USER_CREATION_ERROR');
    }
    const emailVerificationLink = `${process.env.FRONTEND_URL}/login-client/verify-email?code=${newUser.verificationCode}`;

    // 4. Send email confirmation with verification link
    try {
      await sendVerificationEmail(newUser.userEmail, newUser.userFirstName, emailVerificationLink);
    } catch (emailError) {
      console.error('Email failed:', emailError);
    }

    // 5. Always return success to frontend if user is created
    return {
      success: true,
      data: {
        message: 'Registration success.',
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred during registration',
        code: 'REGISTRATION_ERROR',
      },
    };
  }
}

export async function verifyEmailHandler(req: Request) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return errorResponse('Invalid verification code', 'CODE_BAD_REQUEST');
    }
    const existingUser = await user.findOne({
      where: { verificationCode: code, isVerified: false },
    });
    if (!existingUser) {
      return errorResponse('User not found or already verified', 'USER_NOT_FOUND');
    }
    if (existingUser.verificationCodeExpires && new Date() > existingUser.verificationCodeExpires) {
      return errorResponse('Verification code has expired', 'CODE_EXPIRED');
    }
    existingUser.isVerified = true;
    existingUser.verificationCode = undefined; // Clear the verification code
    existingUser.verificationCodeExpires = undefined; // Clear the expiration date
    await existingUser.save();
    return {
      success: true,
      data: { message: 'Email verified successfully' },
    };
  } catch (error) {
    console.error('Verification error:', error);
    return errorResponse('An error occurred during email verification', 'VERIFICATION_ERROR');
  }
}
