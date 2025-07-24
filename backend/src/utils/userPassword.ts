import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

// Password hashing
export const hashPassword = async (userPassword: string): Promise<string> => {
  if (!isPasswordStrong(userPassword)) {
    throw new Error('Password does not meet requirements');
  }
  return await bcrypt.hash(userPassword, SALT_ROUNDS);
};

// Password strength validation
export const isPasswordStrong = (password: string): boolean => {
  const minLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[\W_]/.test(password);
  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  if (!isValid) {
    console.error('Password does not meet strength requirements');
  }
  return isValid;
};

// Verification code generation
export const generateVerificationCode = (): string => {
  return crypto.randomBytes(32).toString('hex'); // 64 characters
};

// Verification code expiration generation
export const generateVerificationCodeExpires = (): Date => {
  const date = new Date();
  return new Date(date.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
};

// Password comparison
export const comparePasswords = async (
  userPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(userPassword, hashedPassword);
};
