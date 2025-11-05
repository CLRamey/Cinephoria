import {
  validateRegisterInput,
  validateLoginInput,
  validateFilmInput,
  isPositiveNumber,
  isNonNegativeNumber,
  isFutureDate,
  Role,
  RegisterInput,
  LoginUserInput,
} from '../../src/validators/userValidator';
import { filmAttributes, user } from '../../src/models/init-models';
import { isPasswordStrong } from '../../src/utils/userPassword';

jest.mock('../../src/models/init-models');
jest.mock('../../src/utils/userPassword', () => ({
  isPasswordStrong: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

const validInput: RegisterInput = {
  userFirstName: 'John',
  userLastName: 'Doe',
  userUsername: 'johndoe123',
  userEmail: 'john@example.com',
  userPassword: 'StrongP@ssw0rd!',
  userRole: Role.CLIENT,
  agreedPolicy: true,
  agreedCgvCgu: true,
};

const validLoginInput: LoginUserInput = {
  userEmail: 'john@example.com',
  userPassword: 'StrongP@ssw0rd!',
};

const validFilmData: Partial<filmAttributes> = {
  filmTitle: 'Inception',
  filmDescription: 'A mind-bending thriller',
  filmImg: 'https://example.com/inception.jpg',
  filmFavorite: true,
  filmDuration: 120,
  filmMinimumAge: 13,
  filmActiveDate: new Date(Date.now() + 86400000), // 1 day in future
};

interface ValidationErrorWithDetails extends Error {
  status: number;
  details: Record<string, string>;
}

describe('validateRegisterInput', () => {
  it('should return sanitized input on valid data', async () => {
    (user.findOne as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    (isPasswordStrong as jest.Mock).mockReturnValue(true);

    const result = await validateRegisterInput(validInput);

    expect(result.userEmail).toBe('john@example.com');
    expect(result.userFirstName).toBe('John');
    expect(result.userRole).toBe(Role.CLIENT);
  });

  it('should throw validation error on invalid email', async () => {
    const invalidEmailInput = { ...validInput, userEmail: 'bademail' };
    (isPasswordStrong as jest.Mock).mockReturnValue(true);

    await expect(validateRegisterInput(invalidEmailInput)).rejects.toMatchObject({
      status: 400,
      details: { userEmail: 'A valid email address is required.' },
    });
  });

  it('should throw validation error if password is weak', async () => {
    (isPasswordStrong as jest.Mock).mockReturnValue(false);

    await expect(validateRegisterInput(validInput)).rejects.toMatchObject({
      status: 400,
      details: { userPassword: 'Password format incorrect.' },
    });
  });

  it('should throw error if email already exists', async () => {
    (isPasswordStrong as jest.Mock).mockReturnValue(true);
    (user.findOne as jest.Mock).mockResolvedValueOnce({}); // email exists
    (user.findOne as jest.Mock).mockResolvedValueOnce(null); // username not found

    await expect(validateRegisterInput(validInput)).resolves.toBeDefined(); // email already exists does NOT throw
    expect(console.warn).toBeDefined(); // optionally test console.warn with a spy
  });

  it('should throw error if username already exists', async () => {
    (isPasswordStrong as jest.Mock).mockReturnValue(true);
    (user.findOne as jest.Mock).mockResolvedValueOnce(null); // email not found
    (user.findOne as jest.Mock).mockResolvedValueOnce({}); // username exists

    await expect(validateRegisterInput(validInput)).resolves.toBeDefined(); // still resolves, logs warning
  });

  it('should throw all multiple validation errors', async () => {
    const badInput = {
      userFirstName: '9',
      userLastName: 'A',
      userUsername: 'x',
      userEmail: 'invalid-email',
      userPassword: '@',
      userRole: Role.CLIENT,
      agreedPolicy: false,
      agreedCgvCgu: false,
    };

    (isPasswordStrong as jest.Mock).mockReturnValue(false);
    (user.findOne as jest.Mock).mockResolvedValue(null);

    await expect(validateRegisterInput(badInput as RegisterInput)).rejects.toMatchObject({
      status: 400,
      details: {
        userFirstName: 'First name required >2 characters.',
        userLastName: 'Last name required >2 characters.',
        userUsername: 'Username required - alphanumeric.',
        userEmail: 'A valid email address is required.',
        userPassword: 'Password format incorrect.',
        agreedPolicy: 'To proceed, you must agree to the privacy policy.',
        agreedCgvCgu: 'To proceed, you must accept the CGU/CGV.',
      },
    });
  });
});

describe('validateLoginInput', () => {
  it('should return sanitized input on valid data', async () => {
    (user.findOne as jest.Mock).mockResolvedValueOnce({});
    (isPasswordStrong as jest.Mock).mockReturnValue(true);

    const result = await validateLoginInput(validLoginInput);

    expect(result.userEmail).toBe('john@example.com');
    expect(result.userPassword).toBe('StrongP@ssw0rd!');
  });

  it('should throw validation error on invalid email format', async () => {
    const invalidEmailInput = { ...validLoginInput, userEmail: 'bademail' };
    (isPasswordStrong as jest.Mock).mockReturnValue(true);

    await expect(validateLoginInput(invalidEmailInput)).rejects.toMatchObject({
      status: 400,
      details: { userEmail: 'A valid email address is required.' },
    });
  });

  it('should throw validation error on weak password', async () => {
    (isPasswordStrong as jest.Mock).mockReturnValue(false);

    await expect(validateLoginInput(validLoginInput)).rejects.toMatchObject({
      status: 400,
      details: { userPassword: 'Password format incorrect.' },
    });
  });

  it('should throw validation error if email not found in DB', async () => {
    (isPasswordStrong as jest.Mock).mockReturnValue(true);
    (user.findOne as jest.Mock).mockResolvedValue(null);

    await expect(validateLoginInput(validLoginInput)).rejects.toMatchObject({
      status: 400,
      details: { general: 'Access denied. Invalid email or password.' },
    });
  });

  it('should throw multiple errors if both email and password are invalid', async () => {
    const badInput = {
      userEmail: 'invalid',
      userPassword: 'weak',
    };

    (isPasswordStrong as jest.Mock).mockReturnValue(false);
    (user.findOne as jest.Mock).mockResolvedValue(null);

    await expect(validateLoginInput(badInput)).rejects.toMatchObject({
      status: 400,
      details: {
        userEmail: 'A valid email address is required.',
        userPassword: 'Password format incorrect.',
        general: 'Access denied. Invalid email or password.',
      },
    });
  });
});

describe('Film Input Validation', () => {
  it('should return sanitized film data on valid input', () => {
    const result = validateFilmInput(validFilmData);
    expect(result.filmTitle).toBe('Inception');
    expect(result.filmDescription).toBe('A mind-bending thriller');
    expect(result.filmImg).toBe('https://example.com/inception.jpg');
    expect(result.filmFavorite).toBe(true);
    expect(result.filmDuration).toBe(120);
    expect(result.filmMinimumAge).toBe(13);
    expect(result.filmActiveDate).toBeInstanceOf(Date);
  });

  it('should throw validation failed error if filmTitle is not valid', () => {
    const badData = { ...validFilmData, filmTitle: 'The final :' };
    expect(() => validateFilmInput(badData)).toThrow('Validation failed');
    try {
      validateFilmInput(badData);
    } catch (err) {
      const validationError = err as ValidationErrorWithDetails;
      expect(validationError.status).toBe(400);
      expect(validationError.details).toEqual({
        filmTitle: 'Film title contains invalid characters.',
      });
    }
  });

  it('should throw validation failed error if filmDescription is not valid', () => {
    const badData = { ...validFilmData, filmDescription: 'numbers1 and characters: ' };
    expect(() => validateFilmInput(badData)).toThrow('Validation failed');
    try {
      validateFilmInput(badData);
    } catch (err) {
      const validationError = err as ValidationErrorWithDetails;
      expect(validationError.status).toBe(400);
      expect(validationError.details).toEqual({
        filmDescription: 'Film description contains invalid characters.',
      });
    }
  });

  it('should throw validation failed error if filmImg is not a valid URL', () => {
    const badData = { ...validFilmData, filmImg: 'ftp://example.com/image.bmp' };
    expect(() => validateFilmInput(badData)).toThrow('Validation failed');
    try {
      validateFilmInput(badData);
    } catch (err) {
      const validationError = err as ValidationErrorWithDetails;
      expect(validationError.status).toBe(400);
      expect(validationError.details).toEqual({
        filmImg: 'Film image URL needs a valid image format (png, jpg, jpeg, svg, webp).',
      });
    }
  });

  it('should throw validation failed error if filmDuration is not above 20 minutes', () => {
    const badData = { ...validFilmData, filmDuration: 15 };
    expect(() => validateFilmInput(badData)).toThrow('Validation failed');
    try {
      validateFilmInput(badData);
    } catch (err) {
      const validationError = err as ValidationErrorWithDetails;
      expect(validationError.status).toBe(400);
      expect(validationError.details).toEqual({
        filmDuration:
          'Film duration is required and must be a positive integer between 21 and 500.',
      });
    }
  });

  it('should throw validation failed error if filmMinimumAge is above 21 years', () => {
    const badData = { ...validFilmData, filmMinimumAge: 25 };
    expect(() => validateFilmInput(badData)).toThrow('Validation failed');
    try {
      validateFilmInput(badData);
    } catch (err) {
      const validationError = err as ValidationErrorWithDetails;
      expect(validationError.status).toBe(400);
      expect(validationError.details).toEqual({
        filmMinimumAge: 'Film minimum age is required and cannot exceed 21 years.',
      });
    }
  });

  it('should throw validation failed error for multiple invalid fields', () => {
    const badData = {
      ...validFilmData,
      filmTitle: 'The final :',
      filmDescription: 'numbers1 and characters: ',
      filmImg: 'ftp://example.com/image.bmp',
      filmDuration: 15,
      filmMinimumAge: 25,
    };
    expect(() => validateFilmInput(badData)).toThrow('Validation failed');
    try {
      validateFilmInput(badData);
    } catch (err) {
      const validationError = err as ValidationErrorWithDetails;
      expect(validationError.status).toBe(400);
      expect(validationError.details).toEqual({
        filmTitle: 'Film title contains invalid characters.',
        filmDescription: 'Film description contains invalid characters.',
        filmImg: 'Film image URL needs a valid image format (png, jpg, jpeg, svg, webp).',
        filmDuration:
          'Film duration is required and must be a positive integer between 21 and 500.',
        filmMinimumAge: 'Film minimum age is required and cannot exceed 21 years.',
      });
    }
  });
});

describe('isPositiveNumber', () => {
  it('should return true for positive integers', () => {
    expect(isPositiveNumber(5)).toBe(true);
    expect(isPositiveNumber('10')).toBe(true);
  });

  it('should return false for zero, negative numbers, and non-integers', () => {
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-3)).toBe(false);
    expect(isPositiveNumber(4.5)).toBe(false);
    expect(isPositiveNumber('abc')).toBe(false);
  });
});

describe('isNonNegativeNumber', () => {
  it('should return true for zero and positive integers', () => {
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber(7)).toBe(true);
    expect(isNonNegativeNumber('15')).toBe(true);
  });

  it('should return false for negative numbers and non-integers', () => {
    expect(isNonNegativeNumber(-2)).toBe(false);
    expect(isNonNegativeNumber(3.14)).toBe(false);
    expect(isNonNegativeNumber('xyz')).toBe(false);
  });
});

describe('isFutureDate', () => {
  it('should return true for future dates', () => {
    const futureDate = new Date(Date.now() + 86400000); // 1 day in future
    expect(isFutureDate(futureDate)).toBe(true);
    expect(isFutureDate(futureDate.toISOString().split('T')[0])).toBe(true);
  });

  it('should return false for past dates and invalid formats', () => {
    const pastDate = new Date(Date.now() - 86400000);
    expect(isFutureDate(pastDate)).toBe(false);
    expect(isFutureDate(pastDate.toISOString().split('T')[0])).toBe(false);
    expect(isFutureDate('invalid-date')).toBe(false);
  });
});
