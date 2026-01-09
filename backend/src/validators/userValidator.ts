import { filmAttributes, incidentAttributes, user } from '../models/init-models';
import { isPasswordStrong } from '../utils/userPassword';
import validator from 'validator';
import { logwarn } from '../utils/logger';

export interface RegisterInput {
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userEmail: string;
  userPassword: string;
  userRole: Role;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
}

export interface LoginUserInput {
  userEmail: string;
  userPassword: string;
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
  const userRole = data.userRole;
  const policy = data.agreedPolicy;
  const cgvCgu = data.agreedCgvCgu;

  if (!firstName || !/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(firstName)) {
    errors.userFirstName = 'First name required >2 characters.';
  }

  if (!lastName || !/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(lastName)) {
    errors.userLastName = 'Last name required >2 characters.';
  }

  if (!username || !validator.isAlphanumeric(username) || !/^[a-zA-Z0-9]{3,30}$/.test(username)) {
    errors.userUsername = 'Username required - alphanumeric.';
  }

  if (
    !email ||
    email.length >= 100 ||
    !validator.isEmail(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.userEmail = 'A valid email address is required.';
  }

  if (
    !password ||
    !isPasswordStrong(password) ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,64}$/.test(password)
  ) {
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
    logwarn('Duplicate registration attempt:', {
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
    userRole: userRole,
    agreedPolicy: policy,
    agreedCgvCgu: cgvCgu,
  };
}

export async function validateLoginInput(data: LoginUserInput): Promise<LoginUserInput> {
  const errors: Record<string, string> = {};

  const email = data.userEmail?.trim().toLowerCase();
  const password = data.userPassword?.trim();

  if (
    !email ||
    email.length >= 100 ||
    !validator.isEmail(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.userEmail = 'A valid email address is required.';
  }

  if (
    !password ||
    !isPasswordStrong(password) ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,64}$/.test(password)
  ) {
    errors.userPassword = 'Password format incorrect.';
  }

  // Check if the email exists in the database
  const userExists = await user.findOne({ where: { userEmail: email } });
  if (!userExists) {
    errors.general = 'Access denied. Invalid email or password.';
  }

  if (Object.keys(errors).length > 0) {
    const error: ValidationError = new Error('Validation failed');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return {
    userEmail: email,
    userPassword: password,
  };
}

// Validate film input data
export function validateFilmInput(filmData: Partial<filmAttributes>): Partial<filmAttributes> {
  const errors: Record<string, string> = {};
  // Basic presence check
  if (!filmData) {
    errors.general = 'No film data provided.';
  }
  // Destructure and sanitize inputs
  const filmTitle = String(filmData.filmTitle);
  const filmDescription = String(filmData.filmDescription);
  const filmImg = String(filmData.filmImg);
  const filmFavorite = Boolean(filmData.filmFavorite);
  const filmDuration = Number(filmData.filmDuration);
  const filmMinimumAge = Number(filmData.filmMinimumAge);
  const filmActiveDate = new Date(filmData.filmActiveDate || '');

  if (!filmTitle || !/^[A-Za-z0-9À-ÿ\s'.,!?-]{3,100}$/.test(filmTitle)) {
    errors.filmTitle = 'Film title contains invalid characters.';
  }

  if (!filmDescription || !/^[A-Za-zÀ-ÿ\s'.,!?-]{10,255}$/.test(filmDescription)) {
    errors.filmDescription = 'Film description contains invalid characters.';
  }

  if (!filmImg || !/^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp))$/i.test(filmImg)) {
    errors.filmImg = 'Film image URL needs a valid image format (png, jpg, jpeg, svg, webp).';
  } else if (filmImg.length < 10 || filmImg.length > 255 || !validator.isURL(filmImg)) {
    errors.filmImg = 'A valid film image URL is required (10 - 255 characters).';
  }

  if (isNaN(filmDuration) || filmDuration <= 20 || filmDuration > 500) {
    errors.filmDuration =
      'Film duration is required and must be a positive integer between 21 and 500.';
  }

  if (isNaN(filmMinimumAge) || filmMinimumAge < 0 || filmMinimumAge > 21) {
    errors.filmMinimumAge = 'Film minimum age is required and cannot exceed 21 years.';
  }

  if (
    !filmActiveDate ||
    (!(filmActiveDate instanceof Date) &&
      !(typeof filmActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(filmActiveDate)))
  ) {
    errors.filmActiveDate = 'A valid film active date is required.';
  }

  if (Object.keys(errors).length > 0) {
    const error: ValidationError = new Error('Validation failed');
    error.status = 400;
    error.details = errors;
    throw error;
  }
  return {
    filmTitle,
    filmDescription,
    filmImg,
    filmFavorite,
    filmDuration,
    filmMinimumAge,
    filmActiveDate,
  };
}

// Positive number validation helper
export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}

export function isNonNegativeNumber(value: unknown): boolean {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
}

// Future date validation helper
export function isFutureDate(value: string | Date): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date > new Date();
}

// Validate incident input data
export function validateIncidentData(
  incidentData: Partial<incidentAttributes>,
): Partial<incidentAttributes> {
  const errors: Record<string, string> = {};
  // Basic presence check
  if (!incidentData) {
    errors.general = 'No incident data provided.';
  }
  // Destructure and sanitize inputs
  const incidentEquipment = String(incidentData.incidentEquipment);
  const incidentDescription = String(incidentData.incidentDescription);

  if (!incidentEquipment || !/^[A-Za-z0-9À-ÿ\s.,-]{3,100}$/.test(incidentEquipment)) {
    errors.incidentEquipment = 'Incident equipment contains invalid characters.';
  }

  if (!incidentDescription || !/^[A-Za-zÀ-ÿ\s.,-]{10,255}$/.test(incidentDescription)) {
    errors.incidentDescription = 'Incident description contains invalid characters.';
  }

  if (Object.keys(errors).length > 0) {
    const error: ValidationError = new Error('Validation failed');
    error.status = 400;
    error.details = errors;
    throw error;
  }
  return {
    incidentEquipment,
    incidentDescription,
  };
}
