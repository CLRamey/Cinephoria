import { TestBed } from '@angular/core/testing';

import { TokenService, JwtPayload } from '../../projects/auth/src/lib/services/token.service';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';

describe('TokenService', () => {
  let service: TokenService;
  let mockPayload: JwtPayload;
  const mockToken = 'test.token.string';
  const mockRole = Role.CLIENT;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    mockPayload = {
      userId: 1,
      userRole: mockRole,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get the token', () => {
    service.setToken(mockToken);
    expect(service.getToken()).toBe(mockToken);
  });

  it('should set the token to the session storage', () => {
    sessionStorage.setItem('token', mockToken);
    expect(sessionStorage.getItem('token')).toBe(mockToken);
  });

  it('should get the token from session storage', () => {
    sessionStorage.setItem('token', mockToken);
    expect(service.getToken()).toBe(mockToken);
  });

  it('should return true for the isTokenExpired method, if no token is present', () => {
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return true for the isTokenExpired method, if the token has expired', () => {
    service.setToken(mockToken);
    jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 3600 * 1000);
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return false for the isTokenExpired method, if the token has not expired', () => {
    service.setToken(mockToken);
    service.getPayload = jest.fn().mockReturnValue(mockPayload);
    jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() - 1000);
    expect(service.isTokenExpired()).toBe(false);
  });

  it('should catch unexpected errors in isTokenExpired', () => {
    service.getPayload = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return false for the hasToken method, if no token exists', () => {
    expect(service.hasToken()).toBe(false);
  });

  it('should return true for the hasToken method, if a token exists and has not expired', () => {
    service.setToken(mockToken);
    service.getPayload = jest.fn().mockReturnValue(mockPayload);
    jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() - 1000); // Simulate current time before expiration
    expect(service.isTokenExpired()).toBe(false);
    expect(service.hasToken()).toBe(true);
  });

  it('should check and return false for the hasToken method, if a token has expired', () => {
    service.setToken(mockToken);
    jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 3600 * 1000);
    expect(service.isTokenExpired()).toBe(true);
    expect(service.hasToken()).toBe(false);
  });

  it('should clear the token', () => {
    service.setToken(mockToken);
    service.clearToken();
    expect(service.getToken()).toBeNull();
  });

  it('should return null if token is invalid', () => {
    service.setToken('invalid.token.string');
    expect(service.getPayload()).toBeNull();
  });

  it('should return null if token is malformed', () => {
    service.setToken('malformed.token');
    expect(service.getPayload()).toBeNull();
  });

  it('should return payload from valid token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(mockPayload));
    const signature = 'signature';
    const validToken = `${header}.${payload}.${signature}`;
    service.setToken(validToken);
    expect(service.getPayload()).toEqual(mockPayload);
  });

  it('should return null if token is empty', () => {
    service.setToken('');
    expect(service.getPayload()).toBeNull();
  });

  it('should clear and return null if there is no token or no payload when looking for the payload', () => {
    service.setToken(mockToken);
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(null));
    const signature = 'signature';
    const validToken = `${header}.${payload}.${signature}`;
    service.setToken(validToken);
    expect(service.getPayload()).toBeNull();
    expect.objectContaining(service.clearToken);
  });
});
