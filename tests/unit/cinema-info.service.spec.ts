import { TestBed } from '@angular/core/testing';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

describe('CinemaInfoService', () => {
  let service: CinemaInfoService;
  let httpMock: HttpTestingController;
  const mockResponse = {
    success: true,
    data: [
      {
        cinemaName: 'Cinéphoria',
        cinemaAddress: '123 rue du cinéma',
        cinemaPostalCode: '75000',
        cinemaCity: 'Paris',
        cinemaCountry: 'France',
        cinemaTelNumber: '0102030405',
        cinemaOpeningHours: '10h-22h',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CinemaInfoService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(CinemaInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch cinema info successfully', () => {
    service.getCinemaInfo().subscribe(result => {
      expect(result).toBeTruthy();
      expect(result?.CinemaInfo.length).toBe(1);
      expect(result?.CinemaInfo[0].cinemaName).toBe('Cinéphoria');
    });

    const req = httpMock.expectOne(`${environment.apiURL}/cinema-info`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error response with success false', () => {
    const errorResponse = { success: false, error: { message: 'Error' } };

    service.getCinemaInfo().subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiURL}/cinema-info`);
    expect(req.request.method).toBe('GET');
    req.flush(errorResponse);
  });

  it('should handle service error and return null', () => {
    service.getCinemaInfo().subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiURL}/cinema-info`);
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle network error gracefully', () => {
    service.getCinemaInfo().subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiURL}/cinema-info`);
    expect(req.request.method).toBe('GET');
    req.error(new ProgressEvent('error'));
  });
});
