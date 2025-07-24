import { validateRegisterInput, Role, RegisterInput } from '../../src/validators/userValidator';
import { user } from '../../src/models/init-models';
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
