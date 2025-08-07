import sanitizeHtml from 'sanitize-html';
import { RegisterInput, LoginUserInput } from '../validators/userValidator';
import { Role } from '../validators/userValidator';

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
  userRole: Role.CLIENT;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
};

type SanitizedLoginInput = {
  userEmail: string;
  userPassword: string;
};

const ALLOWED_ROLE = [Role.CLIENT];

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
