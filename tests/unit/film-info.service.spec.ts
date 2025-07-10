import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import {
  FilmInfo,
  FilmInfoResponse,
  FilmInfoErrorResponse,
} from '../../projects/cinephoria-web/src/app/interfaces/film.ts';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';

describe('FilmInfoService', () => {
  let service: FilmInfoService;
  let httpMock: HttpTestingController;
  const mockFilmData: FilmInfo = {
    filmId: 1,
    filmTitle: 'The Great Adventure',
    filmDescription: 'An epic journey of discovery and survival.',
    filmImg: 'great-adventure.webp',
    filmDuration: 120,
    filmMinimumAge: 12,
    filmActiveDate: '2025-07-01',
    genreFilms: [
      {
        genreId: 1,
        filmId: 1,
        genre: {
          genreId: 1,
          genreType: 'Adventure',
        },
      },
    ],
    cinemaFilms: [
      {
        cinemaId: 1,
        filmId: 1,
        cinema: {
          cinemaId: 1,
          cinemaName: 'Cinéphoria Central',
        },
      },
    ],
    screenings: [],
  };

  const mockSuccessResponse: FilmInfoResponse = {
    success: true,
    data: mockFilmData,
  };

  const mockErrorResponse: FilmInfoErrorResponse = {
    success: false,
    error: { message: 'Error fetching films' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FilmInfoService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(FilmInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFilmInfo', () => {
    it('should fetch film info successfully', () => {
      service.getFilmInfo().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.FilmInfo.length).toBe(1);
        expect(result?.FilmInfo[0].filmTitle).toBe('The Great Adventure');
      });
      const req = httpMock.expectOne(`${environment.apiURL}/film`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getFilmInfo().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/film`);
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getFilmInfo().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/film`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getFilmById', () => {
    const filmId = 1;
    it('should fetch film by ID successfully', () => {
      service.getFilmById(filmId).subscribe(result => {
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBe(true);
        expect(result?.[0].filmTitle).toBe('The Great Adventure');
      });
      const req = httpMock.expectOne(`${environment.apiURL}/film/${filmId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getFilmById(filmId).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/film/${filmId}`);
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getFilmById(filmId).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/film/${filmId}`);
      req.error(new ProgressEvent('error'));
    });
  });
});
