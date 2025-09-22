import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { TokenService } from '../../projects/auth/src/lib/services/token.service';
import { API_URL } from '../../projects/auth/src/lib/shared/utils/api-url.token';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const mockApiUrl = environment.apiURL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        TokenService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: mockApiUrl },
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

  it('should set the token, update authentication state and role on login for the client', () => {
    const mockToken = 'mock-access-token';
    const mockResponse = {
      success: true,
      data: {
        accessToken: mockToken,
        userRole: Role.CLIENT,
      },
    };
    const loginClientSpy = jest.spyOn(service, 'loginClient').mockReturnValue(of(mockResponse));
    service.loginClient({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    const tokenService = TestBed.inject(TokenService);
    jest.spyOn(tokenService, 'setToken').mockImplementation(() => {});
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.CLIENT);
    });
    loginClientSpy.mockRestore();
  });

  it('should set the token, update authentication state and role on login for the employee', () => {
    const mockToken = 'mock-access-token';
    const mockResponse = {
      success: true,
      data: {
        accessToken: mockToken,
        userRole: Role.EMPLOYEE,
      },
    };
    const loginEmployeeSpy = jest.spyOn(service, 'loginEmployee').mockReturnValue(of(mockResponse));
    service.loginEmployee({
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    });
    const tokenService = TestBed.inject(TokenService);
    jest.spyOn(tokenService, 'setToken').mockImplementation(() => {});
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.EMPLOYEE);
    });
    loginEmployeeSpy.mockRestore();
  });

  it('should set the token, update authentication state and role on login for the admin', () => {
    const mockToken = 'mock-access-token';
    const mockResponse = {
      success: true,
      data: {
        accessToken: mockToken,
        userRole: Role.ADMIN,
      },
    };
    const loginAdminSpy = jest.spyOn(service, 'loginAdmin').mockReturnValue(of(mockResponse));
    service.loginAdmin({ userEmail: 'admin@example.com', userPassword: 'StrongPassword123!' });
    const tokenService = TestBed.inject(TokenService);
    jest.spyOn(tokenService, 'setToken').mockImplementation(() => {});
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.ADMIN);
    });
    loginAdminSpy.mockRestore();
  });

  it('should set the update authentication state and role on client login with cookies', () => {
    const mockCookieResponse = {
      success: true,
      data: {
        userRole: Role.CLIENT,
      },
    };
    const loginClientSpy = jest
      .spyOn(service, 'loginCookieClient')
      .mockReturnValue(of(mockCookieResponse));
    service.loginCookieClient({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.CLIENT);
    });
    loginClientSpy.mockRestore();
  });

  it('should set the token, update authentication state and role on employee login with cookies', () => {
    const mockCookieResponse = {
      success: true,
      data: {
        userRole: Role.EMPLOYEE,
      },
    };
    const loginEmployeeSpy = jest
      .spyOn(service, 'loginCookieEmployee')
      .mockReturnValue(of(mockCookieResponse));
    service.loginEmployee({
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    });
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.EMPLOYEE);
    });
    loginEmployeeSpy.mockRestore();
  });

  it('should set the token, update authentication state and role on admin login with cookies', () => {
    const mockCookieResponse = {
      success: true,
      data: {
        userRole: Role.ADMIN,
      },
    };
    const loginAdminSpy = jest
      .spyOn(service, 'loginCookieAdmin')
      .mockReturnValue(of(mockCookieResponse));
    service.loginAdmin({ userEmail: 'admin@example.com', userPassword: 'StrongPassword123!' });
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.ADMIN);
    });
    loginAdminSpy.mockRestore();
  });
});
