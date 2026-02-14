import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QualityInfoService } from '../../projects/cinephoria-web/src/app/services/quality-info.service';
import {
  QualityInfo,
  QualityInfoResponse,
  QualityInfoErrorResponse,
} from '../../projects/cinephoria-web/src/app/interfaces/quality.ts';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

describe('QualityInfoService', () => {
  let service: QualityInfoService;
  let httpMock: HttpTestingController;
  const mockQualityInfo: QualityInfo = {
    qualityId: 1,
    qualityProjectionType: 'IMAX',
    qualityProjectionPrice: 15.99,
  };

  const mockSuccessResponse: QualityInfoResponse = {
    success: true,
    data: [mockQualityInfo],
  };

  const mockErrorResponse: QualityInfoErrorResponse = {
    success: false,
    error: { message: 'Error fetching quality info' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QualityInfoService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(QualityInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQualityInfo', () => {
    it('should return quality info on success', () => {
      service.getQualityInfo().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.length).toBe(1);
        expect(result?.[0].qualityProjectionType).toBe('IMAX');
        expect(result?.[0].qualityProjectionPrice).toBe(15.99);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/quality`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getQualityInfo().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/quality`);
      expect(req.request.method).toBe('GET');
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getQualityInfo().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/quality`);
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getQualityById', () => {
    const qualityId = 1;
    it('should return quality info on success', () => {
      service.getQualityById(qualityId).subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.qualityProjectionType).toBe('IMAX');
        expect(result?.qualityProjectionPrice).toBe(15.99);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/quality/${qualityId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getQualityById(qualityId).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/quality/${qualityId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getQualityById(qualityId).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/quality/${qualityId}`);
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'));
    });
  });
});
