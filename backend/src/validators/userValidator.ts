import { user } from '../models/init-models';
import { isPasswordStrong } from '../utils/userPassword';

export interface RegisterInput {
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userEmail: string;
  userPassword: string;
  userRole: Role.CLIENT;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
}

export enum Role {
  CLIENT = 'client',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

interface ValidationError extends Error {
  status?: number;
  details?: Record<string, string>;
}

// This function validates the registration input for a new user
export async function validateRegisterInput(data: RegisterInput): Promise<RegisterInput> {
  const errors: Record<string, string> = {};

  const firstName = data.userFirstName?.trim();
  const lastName = data.userLastName?.trim();
  const username = data.userUsername?.trim();
  const email = data.userEmail?.trim().toLowerCase();
  const password = data.userPassword?.trim();
  const policy = data.agreedPolicy;
  const cgvCgu = data.agreedCgvCgu;

  if (!firstName || !/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(firstName)) {
    errors.userFirstName = 'First name required >2 characters.';
  }

  if (!lastName || !/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(lastName)) {
    errors.userLastName = 'Last name required >2 characters.';
  }

  if (!username || !/^[a-zA-Z0-9]{3,30}$/.test(username)) {
    errors.userUsername = 'Username required - alphanumeric.';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.userEmail = 'A valid email address is required.';
  }

  if (!password || !isPasswordStrong(password)) {
    errors.userPassword = 'Password format incorrect.';
  }

  if (policy === undefined || policy === false) {
    errors.agreedPolicy = 'To proceed, you must agree to the privacy policy.';
  }

  if (cgvCgu === undefined || cgvCgu === false) {
    errors.agreedCgvCgu = 'To proceed, you must accept the CGU/CGV.';
  }

  // Check for existing email and username in the database
  const [emailExists, usernameExists] = await Promise.all([
    user.findOne({ where: { userEmail: email } }),
    user.findOne({ where: { userUsername: username } }),
  ]);

  if (emailExists || usernameExists) {
    console.warn('Duplicate registration attempt:', {
      emailExists: !!emailExists,
      usernameExists: !!usernameExists,
    });
  }

  if (Object.keys(errors).length > 0) {
    const error: ValidationError = new Error('Validation failed');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return {
    userFirstName: firstName,
    userLastName: lastName,
    userUsername: username,
    userEmail: email,
    userPassword: password,
    userRole: Role.CLIENT, // force client role here
    agreedPolicy: policy,
    agreedCgvCgu: cgvCgu,
  };
}
