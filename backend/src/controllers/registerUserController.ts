import { Request } from 'express';
import { registerUser } from '../services/registerUserService';
import { asyncHandler } from '../middlewares/asyncHandler';
import { sanitizeRegisterInput } from '../utils/sanitize';
import { validateRegisterInput } from '../validators/userValidator';
import { sendVerificationEmail } from '../utils/verificationEmail';
import { errorResponse } from '../interfaces/serviceResponse';
import { user } from '../models/init-models';
import { Role } from '../validators/userValidator';

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
      userRole = Role.CLIENT,
      agreedPolicy,
      agreedCgvCgu,
    } = req.body;
    if (
      !userFirstName ||
      !userLastName ||
      !userUsername ||
      !userEmail ||
      !userPassword ||
      !userRole ||
      !agreedPolicy ||
      !agreedCgvCgu
    ) {
      return errorResponse('All fields are required', 'BAD_REQUEST');
    }
    // 1. Validate input
    const sanitized = sanitizeRegisterInput(req.body);
    const validatedData = await validateRegisterInput(sanitized);

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

// This function handles email verification
export async function verifyEmailHandler(req: Request) {
  try {
    const code = req.query.code as string;
    const codeValidated = code?.trim() ?? '';
    const isValidCode = (codeValidated: string) => /^[a-f0-9]{64}$/.test(codeValidated);
    // Validate the code
    if (!code || !isValidCode(codeValidated)) {
      return errorResponse('Invalid verification code', 'BAD_REQUEST');
    }
    // Find user by verification code
    const userToVerify = await user.findOne({
      where: { verificationCode: codeValidated, isVerified: false },
      attributes: ['userId', 'verificationCode', 'verificationCodeExpires', 'isVerified'],
    });
    if (!userToVerify) {
      return errorResponse('User not found or already verified', 'NOT_FOUND');
    }
    if (userToVerify.verificationCodeExpires && userToVerify.verificationCodeExpires < new Date()) {
      return errorResponse('Verification code has expired', 'CODE_EXPIRED');
    }
    // Update user to set isVerified to true and clear verification code
    await userToVerify.update({
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
      userUpdatedAt: new Date(),
    });
    return {
      success: true,
      data: { message: 'Email verified successfully' },
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: { message: 'An error occurred during email verification', code: 'VERIFICATION_ERROR' },
    };
  }
}
