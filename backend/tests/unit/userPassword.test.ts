import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  hashPassword,
  isPasswordStrong,
  generateVerificationCode,
  generateVerificationCodeExpires,
  comparePasswords,
} from '../../src/utils/userPassword';

jest.mock('bcrypt');
jest.mock('crypto');

afterEach(() => {
  jest.resetAllMocks();
});

describe('Password Utils', () => {
  it('should return true for a strong password', () => {
    expect(isPasswordStrong('StrongP@ssw0rd!')).toBe(true);
  });

  it('should return false if password is too short', () => {
    expect(isPasswordStrong('S@1a')).toBe(false);
  });

  it('should return false if missing uppercase', () => {
    expect(isPasswordStrong('weakp@ssw0rd1')).toBe(false);
  });

  it('should return false if missing lowercase', () => {
    expect(isPasswordStrong('WEAKP@SSW0RD1')).toBe(false);
  });

  it('should return false if missing number', () => {
    expect(isPasswordStrong('WeakPassword!')).toBe(false);
  });

  it('should return false if missing special character', () => {
    expect(isPasswordStrong('WeakPassw0rd1')).toBe(false);
  });

  it('should hash the password when strong', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    const result = await hashPassword('StrongP@ssw0rd!');
    expect(bcrypt.hash).toHaveBeenCalledWith('StrongP@ssw0rd!', 12);
    expect(result).toBe('hashedPassword');
  });

  it('should throw error for weak password', async () => {
    await expect(hashPassword('weak')).rejects.toThrow('Password does not meet requirements');
  });

  it('should return true when passwords match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await comparePasswords('plainPassword', 'hashedPassword');
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    expect(result).toBe(true);
  });

  it('should return false when passwords do not match', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = await comparePasswords('wrongPassword', 'hashedPassword');
    expect(result).toBe(false);
  });

  it('should generate a 64 character hex string as verification code', () => {
    (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from('a'.repeat(32), 'utf-8'));
    const code = generateVerificationCode();
    expect(code).toHaveLength(64);
  });

  it('should generate a verification code expiration 1 hour from now', () => {
    const now = new Date();
    const expires = generateVerificationCodeExpires();
    const diff = expires.getTime() - now.getTime();
    expect(diff).toBeGreaterThanOrEqual(3600000 - 1000); // 1 hour minus 1 second tolerance
    expect(diff).toBeLessThanOrEqual(3600000 + 1000); // 1 hour plus 1 second tolerance
  });
});
