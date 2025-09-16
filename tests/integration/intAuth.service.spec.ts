import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { TokenService } from '../../projects/auth/src/lib/services/token.service';
import { API_URL } from '../../projects/auth/src/lib/shared/utils/api-url.token';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const mockApiUrl = environment.apiURL;

  const mockTokenService = {
    setToken: jest.fn(),
    hasToken: jest.fn(),
    clearToken: jest.fn(),
    getPayload: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        TokenService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: mockApiUrl },
        { provide: TokenService, useValue: mockTokenService },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check if user is authenticated', () => {
    mockTokenService.hasToken.mockReturnValue(true);
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
  });

  it('should login client and store token / update state', () => {
    const mockToken = 'mock-token';
    const mockResponse = { data: { accessToken: mockToken } };
    mockTokenService.getPayload.mockReturnValue({ userRole: 'CLIENT' });
    service.loginClient({ userEmail: 'a@a.com', userPassword: 'pass' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-client`);
    req.flush(mockResponse);
    expect(mockTokenService.setToken).toHaveBeenCalledWith(mockToken);
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.CLIENT);
    });
  });

  it('should login employee and store token / update state', () => {
    const mockToken = 'mock-token';
    const mockResponse = { data: { accessToken: mockToken } };
    mockTokenService.getPayload.mockReturnValue({ userRole: 'EMPLOYEE' });
    service.loginEmployee({ userEmail: 'a@a.com', userPassword: 'pass' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-employee`);
    req.flush(mockResponse);
    expect(mockTokenService.setToken).toHaveBeenCalledWith(mockToken);
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.EMPLOYEE);
    });
  });

  it('should login admin and store token / update state', () => {
    const mockToken = 'mock-token';
    const mockResponse = { data: { accessToken: mockToken } };
    mockTokenService.getPayload.mockReturnValue({ userRole: 'ADMIN' });
    service.loginAdmin({ userEmail: 'a@a.com', userPassword: 'pass' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-admin`);
    req.flush(mockResponse);
    expect(mockTokenService.setToken).toHaveBeenCalledWith(mockToken);
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.ADMIN);
    });
  });

  it('should check if there is a token when getUserRole is called', () => {
    mockTokenService.getPayload.mockReturnValue({ userRole: 'CLIENT' });
    expect(mockTokenService.hasToken()).toBe(true);
    expect(service.getUserRole()).toBe(Role.CLIENT);
  });

  it('should return CLIENT role from payload', () => {
    mockTokenService.getPayload.mockReturnValue({ userRole: 'CLIENT' });
    expect(service.getUserRole()).toBe(Role.CLIENT);
  });

  it('should return EMPLOYEE role from payload', () => {
    mockTokenService.getPayload.mockReturnValue({ userRole: 'EMPLOYEE' });
    expect(service.getUserRole()).toBe(Role.EMPLOYEE);
  });

  it('should return ADMIN role from payload', () => {
    mockTokenService.getPayload.mockReturnValue({ userRole: 'ADMIN' });
    expect(service.getUserRole()).toBe(Role.ADMIN);
  });

  it('should return null for unknown role', () => {
    mockTokenService.getPayload.mockReturnValue({ userRole: 'SOMETHINGELSE' });
    expect(service.getUserRole()).toBeNull();
  });

  it('should return null when payload missing', () => {
    mockTokenService.getPayload.mockReturnValue(null);
    expect(service.getUserRole()).toBeNull();
  });

  it('should refresh auth state when token exists', async () => {
    mockTokenService.hasToken.mockReturnValue(true);
    mockTokenService.getPayload.mockReturnValue({ userRole: 'ADMIN' });
    await service.refreshAuthState();
    service.isAuthenticated$.subscribe(val => expect(val).toBe(true));
    service.userRole$.subscribe(role => expect(role).toBe(Role.ADMIN));
  });

  it('should clear token and reset state on logout', () => {
    service.logout();
    expect(mockTokenService.clearToken).toHaveBeenCalled();
    service.isAuthenticated$.subscribe(val => expect(val).toBe(false));
    service.userRole$.subscribe(role => expect(role).toBeNull());
  });
});
