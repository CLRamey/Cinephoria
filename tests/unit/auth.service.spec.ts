import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { TokenService } from '../../projects/auth/src/lib/services/token.service';
import { API_URL } from '../../projects/auth/src/lib/shared/utils/api-url.token';
import { RegisterUser, Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

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

  it('should register a new user', () => {
    const mockUserInput = {
      userFirstName: 'Alice',
      userLastName: 'Smith',
      userUsername: 'alicesmith',
      userEmail: 'alice@example.com',
      userPassword: 'StrongPassword123!',
      userRole: Role.CLIENT,
      agreedPolicy: true,
      agreedCgvCgu: true,
    } as RegisterUser;

    service.register(mockUserInput).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/register-client`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUserInput);
    expect(req.request.responseType).toBe('json');
    req.flush({ success: true });
  });

  it('should handle registration error', () => {
    const mockUserInput = {
      userFirstName: 'Alice',
      userLastName: 'Smith',
      userUsername: 'alicesmith',
      userEmail: 'alice@example.com',
      userPassword: 'StrongPassword123!',
      userRole: Role.CLIENT,
      agreedPolicy: true,
      agreedCgvCgu: true,
    } as RegisterUser;
    service.register(mockUserInput).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/register-client`);
    expect(req.request.method).toBe('POST');
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should login a client user', () => {
    const mockCredentials = { userEmail: 'alice@example.com', userPassword: 'StrongPassword123!' };
    service.loginClient(mockCredentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-client`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    expect(req.request.responseType).toBe('json');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.CLIENT);
    });
    req.flush({ success: true });
  });

  it('should handle client login error', () => {
    const mockCredentials = { userEmail: 'alice@example.com', userPassword: 'StrongPassword123!' };
    service.loginClient(mockCredentials).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-client`);
    expect(req.request.method).toBe('POST');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should login an employee user', () => {
    const mockCredentials = {
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    };
    service.loginEmployee(mockCredentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-employee`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    expect(req.request.responseType).toBe('json');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.EMPLOYEE);
    });
    req.flush({ success: true });
  });

  it('should handle employee login error', () => {
    const mockCredentials = {
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    };
    service.loginEmployee(mockCredentials).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-employee`);
    expect(req.request.method).toBe('POST');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should login an admin user', () => {
    const mockCredentials = { userEmail: 'admin@example.com', userPassword: 'StrongPassword123!' };
    service.loginAdmin(mockCredentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-admin`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    expect(req.request.responseType).toBe('json');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.ADMIN);
    });
    req.flush({ success: true });
  });

  it('should handle admin login error', () => {
    const mockCredentials = { userEmail: 'admin@example.com', userPassword: 'StrongPassword123!' };
    service.loginAdmin(mockCredentials).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-admin`);
    expect(req.request.method).toBe('POST');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should check if user is authenticated', () => {
    const isAuthenticated = service.isAuthenticated();
    expect(isAuthenticated).toBe(false);
  });

  it('should get client user role from token', () => {
    const mockRole = Role.CLIENT;
    jest.spyOn(service, 'getUserRole').mockReturnValue(mockRole);
    const userRole = service.getUserRole();
    expect(userRole).toBe(mockRole);
  });

  it('should get admin user role from token', () => {
    const mockRole = Role.ADMIN;
    jest.spyOn(service, 'getUserRole').mockReturnValue(mockRole);
    const userRole = service.getUserRole();
    expect(userRole).toBe(mockRole);
  });

  it('should return null if user role is not set', () => {
    jest.spyOn(service, 'getUserRole').mockReturnValue(null);
    const userRole = service.getUserRole();
    expect(userRole).toBeNull();
  });

  it('should update the user role from getUserRole', () => {
    const mockRole = Role.CLIENT;
    jest.spyOn(service, 'getUserRole').mockReturnValue(mockRole);
    service.updateUserRoleFromLogin();
    service.userRole$.subscribe(role => {
      expect(role).toBe(mockRole);
    });
  });

  it('should refresh the Authentication state', () => {
    service.refreshAuthState().then(() => {
      service.isAuthenticated$.subscribe(value => {
        expect(value).toBe(false);
      });
      service.userRole$.subscribe(role => {
        expect(role).toBe(null);
      });
    });
  });

  it('should logout a user when logout is called', () => {
    service.logout();
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
  });

  it('should login a client user with cookies', () => {
    const mockCredentials = { userEmail: 'alice@example.com', userPassword: 'StrongPassword123!' };
    service.loginCookieClient(mockCredentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-client`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    expect(req.request.responseType).toBe('json');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.CLIENT);
    });
    req.flush({ success: true });
  });

  it('should handle client login error with cookies', () => {
    const mockCredentials = { userEmail: 'alice@example.com', userPassword: 'StrongPassword123!' };
    service.loginCookieClient(mockCredentials).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-client`);
    expect(req.request.method).toBe('POST');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should login an employee user with cookies', () => {
    const mockCredentials = {
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    };
    service.loginCookieEmployee(mockCredentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-employee`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    expect(req.request.responseType).toBe('json');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.EMPLOYEE);
    });
    req.flush({ success: true });
  });

  it('should handle employee login error with cookies', () => {
    const mockCredentials = {
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    };
    service.loginCookieEmployee(mockCredentials).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-employee`);
    expect(req.request.method).toBe('POST');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should login an admin user with cookies', () => {
    const mockCredentials = { userEmail: 'admin@example.com', userPassword: 'StrongPassword123!' };
    service.loginCookieAdmin(mockCredentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-admin`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    expect(req.request.responseType).toBe('json');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(true);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(Role.ADMIN);
    });
    req.flush({ success: true });
  });

  it('should handle admin login error with cookies', () => {
    const mockCredentials = { userEmail: 'admin@example.com', userPassword: 'StrongPassword123!' };
    service.loginCookieAdmin(mockCredentials).subscribe({
      next: () => fail('should have failed with 500 error'),
      error(error) {
        expect(error.status).toBe(500);
        expect(error.error).toContain('Internal Server Error');
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/login-admin`);
    expect(req.request.method).toBe('POST');
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should logout a user when logoutSecurely is called', () => {
    service.logoutSecurely();
    service.isAuthenticated$.subscribe(value => {
      expect(value).toBe(false);
    });
    service.userRole$.subscribe(role => {
      expect(role).toBe(null);
    });
  });
});
