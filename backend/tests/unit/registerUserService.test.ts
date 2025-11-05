import {
  registerUser,
  registerEmployee,
  resetPassword,
} from '../../src/services/registerUserService';
import { user, userCreationAttributes } from '../../src/models/init-models';
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

const mockEmployeeInput: userCreationAttributes = {
  userFirstName: 'Alice',
  userLastName: 'Smith',
  userUsername: 'alicesmith',
  userEmail: 'alice@example.com',
  userPassword: 'StrongPassword123!',
  userRole: Role.EMPLOYEE,
  agreedPolicy: true,
  agreedCgvCgu: true,
};

const mockEmployeeCreated = {
  get: () => ({
    userId: 1,
    userFirstName: 'Alice',
    userLastName: 'Smith',
    userUsername: 'alicesmith',
    userEmail: 'alice@example.com',
    userPassword: 'hashedPassword123',
    userRole: Role.EMPLOYEE,
    agreedPolicy: true,
    agreedCgvCgu: true,
  }),
};

describe('registerEmployee', () => {
  it('should register an employee and return success', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (user.create as jest.Mock).mockResolvedValue(mockEmployeeCreated);

    const result = await registerEmployee({ ...mockEmployeeInput });

    expect(hashPassword).toHaveBeenCalledWith('StrongPassword123!');
    expect(user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userFirstName: 'Alice',
        userLastName: 'Smith',
        userUsername: 'alicesmith',
        userEmail: 'alice@example.com',
        userPassword: 'hashedPassword123',
        userRole: Role.EMPLOYEE,
        agreedPolicy: true,
        agreedCgvCgu: true,
      }),
      { returning: true },
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.userId).not.toBeNaN();
      expect(result.data?.userEmail).toBe('alice@example.com');
    }
  });

  it('should return error response on employee registration failure', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (user.create as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await registerUser({ ...mockEmployeeInput });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('REGISTRATION_ERROR');
    }
  });
});

describe('resetPassword', () => {
  it('should reset password and return success', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('newHashedPassword123');
    (user.update as jest.Mock).mockResolvedValue([1]);
    (user.findOne as jest.Mock).mockResolvedValue(mockUserCreated);
    const result = await resetPassword(1, 'NewPassword123!');
    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        userPassword: 'newHashedPassword123',
        userUpdatedAt: expect.any(Date),
      }),
      { where: { userId: 1 } },
    );
    expect(user.findOne).toHaveBeenCalledWith({
      where: { userId: 1 },
      attributes: ['userEmail'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userEmail).toBe('alice@example.com');
    }
  });

  it('should return error response if user not found during password reset', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('newHashedPassword123');
    (user.update as jest.Mock).mockResolvedValue([0]);
    const result = await resetPassword(1, 'NewPassword123!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('USER_NOT_FOUND');
    }
  });

  it('should return error response on password reset failure', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('newHashedPassword123');
    (user.update as jest.Mock).mockRejectedValue(new Error('Database error'));
    const result = await resetPassword(1, 'NewPassword123!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('PASSWORD_RESET_ERROR');
    }
  });
});
