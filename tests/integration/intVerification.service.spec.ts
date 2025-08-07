import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { VerificationService } from '../../projects/cinephoria-web/src/app/services/verification.service';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

describe('VerificationService', () => {
  let service: VerificationService;
  let httpMock: HttpTestingController;
  const mockCode = 'test-code';
  const apiUrl = environment.apiURL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VerificationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(VerificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the correct URL and return response when verifyEmail succeeds', () => {
    const mockResponse = { status: 'verified' };
    service.verifyEmail(mockCode).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${apiUrl}/verify-email?code=${mockCode}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mockResponse);
  });

  it('should catch error and return null when verifyEmail fails', () => {
    const mockError = { message: 'Internal Server Error' };
    service.verifyEmail(mockCode).subscribe(response => {
      expect(response).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/verify-email?code=${mockCode}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockError, { status: 500, statusText: 'Server Error' });
  });
});
