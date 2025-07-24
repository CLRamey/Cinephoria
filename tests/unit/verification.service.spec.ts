import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { VerificationService } from '../../projects/cinephoria-web/src/app/services/verification.service';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

describe('VerificationService', () => {
  let service: VerificationService;
  let httpMock: HttpTestingController;

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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to verify email and return response', () => {
    const mockCode = 'abc123';
    const mockResponse = { success: true };

    service.verifyEmail(mockCode).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.apiURL}/verify-email`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ code: mockCode });
    expect(req.request.responseType).toBe('json');
    req.flush(mockResponse);
  });

  it('should handle error and return null observable', () => {
    const mockCode = 'errorCode';
    service.verifyEmail(mockCode).subscribe(response => {
      expect(response).toBeNull();
    });
    const req = httpMock.expectOne(`${environment.apiURL}/verify-email`);
    req.error(new ProgressEvent('error'));
  });
});
