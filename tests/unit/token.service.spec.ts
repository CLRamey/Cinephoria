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
      isVerified: true,
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

  it('should set and get token', () => {
    service.setToken(mockToken);
    expect(service.getToken()).toBe(mockToken);
  });

  it('should return false if no token exists', () => {
    expect(service.hasToken()).toBe(false);
  });

  it('should remove token', () => {
    service.setToken(mockToken);
    service.clearToken();
    expect(service.getToken()).toBeNull();
  });

  it('should return null if token is invalid', () => {
    service.setToken('invalid.token.string');
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
});
