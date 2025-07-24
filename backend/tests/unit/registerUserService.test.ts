import { registerUser } from '../../src/services/registerUserService';
import { user } from '../../src/models/init-models';
import {
  hashPassword,
  generateVerificationCode,
  generateVerificationCodeExpires,
} from '../../src/utils/userPassword';
import { Role } from '../../src/validators/userValidator';

jest.mock('../../src/models/init-models');
jest.mock('../../src/utils/userPassword');

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

const mockUserInput = {
  userFirstName: 'Alice',
  userLastName: 'Smith',
  userUsername: 'alicesmith',
  userEmail: 'alice@example.com',
  userPassword: 'StrongPassword123!',
  userRole: Role.CLIENT,
  agreedPolicy: true,
  agreedCgvCgu: true,
};

const mockUserCreated = {
  get: () => ({
    userId: 1,
    userRole: Role.CLIENT,
    isVerified: false,
    userEmail: 'alice@example.com',
    userFirstName: 'Alice',
    verificationCode: 'abc123',
  }),
};

describe('registerUser', () => {
  it('should register a user and return success', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (generateVerificationCode as jest.Mock).mockReturnValue('abc123');
    (generateVerificationCodeExpires as jest.Mock).mockReturnValue(new Date());
    (user.create as jest.Mock).mockResolvedValue(mockUserCreated);

    const result = await registerUser({ ...mockUserInput });

    expect(hashPassword).toHaveBeenCalledWith('StrongPassword123!');
    expect(user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userPassword: 'hashedPassword123',
        verificationCode: 'abc123',
        verificationCodeExpires: expect.any(Date),
      }),
      { returning: true },
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.userRole).toBe(Role.CLIENT);
      expect(result.data?.isVerified).toBe(false);
      expect(result.data?.userEmail).toBe('alice@example.com');
      expect(result.data?.userFirstName).toBe('Alice');
      expect(result.data?.verificationCode).toBe('abc123');
    }
  });

  it('should return error response on failure', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (generateVerificationCode as jest.Mock).mockReturnValue('abc123');
    (generateVerificationCodeExpires as jest.Mock).mockReturnValue(new Date());
    (user.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await registerUser({ ...mockUserInput });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('REGISTRATION_ERROR');
    }
  });
});
