const TEST_SECRET = 'test.jwt.secret';
process.env.JWT_SECRET = TEST_SECRET;

import jwt from 'jsonwebtoken';
import {
  createToken,
  generateAccessToken,
  verifyToken,
  TokenPayload,
  VerificationTokenPayload,
} from '../../src/utils/tokenManagement';
import { Role } from '../../src/validators/userValidator';

describe('JWT token utils', () => {
  beforeAll(() => {});

  afterAll(() => {
    delete process.env.JWT_SECRET;
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const payload: TokenPayload = {
    userId: 123,
    userRole: Role.CLIENT,
  };

  it('should create a valid JWT token with correct payload', () => {
    const token = createToken(payload);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, TEST_SECRET) as VerificationTokenPayload;
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.userRole).toBe(payload.userRole);
    expect(typeof decoded.iat).toBe('number');
    expect(typeof decoded.exp).toBe('number');
  });

  it('should create a token with the given userId and userRole', () => {
    const token = generateAccessToken(payload.userId, payload.userRole);
    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, TEST_SECRET) as VerificationTokenPayload;
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.userRole).toBe(payload.userRole);
  });

  it('should return decoded payload for a valid token', () => {
    const token = createToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.userRole).toBe(payload.userRole);
  });

  it('should throw an error for an invalid token', () => {
    const invalidToken = 'invalid.token.value';
    expect(() => verifyToken(invalidToken)).toThrow('Invalid');
  });

  it('should throw an error for an expired token', () => {
    // Create a token that expires immediately
    const expiredToken = jwt.sign(payload, TEST_SECRET, { expiresIn: '1ms' });
    // Wait a bit to ensure expiration
    return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
      expect(() => verifyToken(expiredToken)).toThrow('Invalid');
    });
  });
});
