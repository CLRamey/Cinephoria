import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { TokenService } from '../../projects/auth/src/lib/services/token.service';
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
        { provide: 'API_URL', useValue: mockApiUrl },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
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
});
