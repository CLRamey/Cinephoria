import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { GenreInfoService } from '../../projects/cinephoria-web/src/app/services/genre-info.service';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import {
  GenreInfo,
  GenreResponse,
  GenreErrorResponse,
} from '../../projects/cinephoria-web/src/app/interfaces/genre.ts';

describe('GenreInfoService', () => {
  let service: GenreInfoService;
  let httpMock: HttpTestingController;
  const mockGenreData: GenreInfo[] = [
    {
      genreId: 1,
      genreType: 'Action',
    },
    {
      genreId: 2,
      genreType: 'Comedy',
    },
  ];

  const mockSuccessResponse: GenreResponse = {
    success: true,
    data: mockGenreData,
  };

  const mockErrorResponse: GenreErrorResponse = {
    success: false,
    error: { message: 'Error fetching genres' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GenreInfoService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(GenreInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGenreInfo', () => {
    it('should fetch genre info successfully', () => {
      service.getGenreInfo().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.length).toBe(2);
        expect(result?.[0].genreType).toBe('Action');
      });
      const req = httpMock.expectOne(`${environment.apiURL}/genre`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getGenreInfo().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/genre`);
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getGenreInfo().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/genre`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getGenreById', () => {
    const genreId = 1;
    it('should fetch genre by ID successfully', () => {
      service.getGenreById(genreId).subscribe(result => {
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBe(true);
        expect(result?.genreType).toBe('Action');
      });
      const req = httpMock.expectOne(`${environment.apiURL}/genre/${genreId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockSuccessResponse, data: mockGenreData[0] });
    });

    it('should return null on API error response', () => {
      service.getGenreById(genreId).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/genre/${genreId}`);
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getGenreById(genreId).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/genre/${genreId}`);
      req.error(new ProgressEvent('error'));
    });
  });
});
