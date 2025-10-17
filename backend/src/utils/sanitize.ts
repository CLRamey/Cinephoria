import sanitizeHtml from 'sanitize-html';
import { RegisterInput, LoginUserInput, Role } from '../validators/userValidator';
import { filmAttributes } from '../models/film';

// Function to sanitize a single string input
export function sanitizeUserInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    transformTags: {
      script: () => ({ tagName: 'span', attribs: {}, text: '' }),
      style: () => ({ tagName: 'span', attribs: {}, text: '' }),
    },
  });
}

// Function to sanitize all string properties in an object
export function sanitizeUserInputObject(data: Record<string, unknown>): Record<string, string> {
  const sanitizedData: Record<string, string> = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      sanitizedData[key] = typeof value === 'string' ? sanitizeUserInput(value) : String(value);
    }
  }
  return sanitizedData;
}

type SanitizedRegisterInput = {
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userEmail: string;
  userPassword: string;
  userRole: Role;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
};

type SanitizedLoginInput = {
  userEmail: string;
  userPassword: string;
};

// Allow only CLIENT role for user registration
const ALLOWED_ROLE = [Role.CLIENT];

// Function to sanitize registration input data
export function sanitizeRegisterInput(data: RegisterInput): SanitizedRegisterInput {
  const {
    userFirstName,
    userLastName,
    userUsername,
    userEmail,
    userPassword,
    userRole,
    agreedPolicy,
    agreedCgvCgu,
  } = data;

  const sanitized = sanitizeUserInputObject({
    userFirstName,
    userLastName,
    userUsername,
    userEmail,
  });

  return {
    userFirstName: sanitized.userFirstName,
    userLastName: sanitized.userLastName,
    userUsername: sanitized.userUsername,
    userEmail: sanitized.userEmail,
    userPassword,
    userRole: ALLOWED_ROLE.includes(userRole) ? userRole : Role.CLIENT,
    agreedPolicy: Boolean(agreedPolicy),
    agreedCgvCgu: Boolean(agreedCgvCgu),
  };
}

// Restrict staff creation roles to EMPLOYEE only
const RESTRICTED_STAFF_ROLE = [Role.EMPLOYEE];

// Function to sanitize employee registration input data
export function sanitizeEmployeeInput(data: RegisterInput): SanitizedRegisterInput {
  const {
    userFirstName,
    userLastName,
    userUsername,
    userEmail,
    userPassword,
    userRole,
    agreedPolicy,
    agreedCgvCgu,
  } = data;

  const sanitized = sanitizeUserInputObject({
    userFirstName,
    userLastName,
    userUsername,
    userEmail,
  });

  return {
    userFirstName: sanitized.userFirstName,
    userLastName: sanitized.userLastName,
    userUsername: sanitized.userUsername,
    userEmail: sanitized.userEmail,
    userPassword,
    userRole: RESTRICTED_STAFF_ROLE.includes(userRole) ? userRole : Role.EMPLOYEE,
    agreedPolicy: Boolean(agreedPolicy),
    agreedCgvCgu: Boolean(agreedCgvCgu),
  };
}

// Function to sanitize login input data
export function sanitizeLoginInput(data: LoginUserInput): SanitizedLoginInput {
  const { userEmail, userPassword } = data;
  const sanitized = sanitizeUserInputObject({
    userEmail,
  });
  return {
    userEmail: sanitized.userEmail,
    userPassword: userPassword,
  };
}

// Function to sanitize film input data
export function sanitizeFilmInput(data: Partial<filmAttributes>): Partial<filmAttributes> {
  const sanitized: Partial<filmAttributes> = { ...data };
  if (data.filmTitle && typeof data.filmTitle === 'string') {
    sanitized.filmTitle = sanitizeUserInput(data.filmTitle);
  }
  if (data.filmDescription && typeof data.filmDescription === 'string') {
    sanitized.filmDescription = sanitizeUserInput(data.filmDescription);
  }
  if (data.filmImg && typeof data.filmImg === 'string') {
    sanitized.filmImg = sanitizeUserInput(data.filmImg);
  }
  if (data.filmPublishingState && typeof data.filmPublishingState === 'string') {
    sanitized.filmPublishingState = sanitizeUserInput(data.filmPublishingState) as
      | 'active'
      | 'inactive';
  }
  return sanitized;
}
