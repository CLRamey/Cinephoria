import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StaffActionsService } from '../../projects/auth/src/lib/services/staff-actions.service';
import { API_URL } from '../../projects/auth/src/lib/shared/utils/api-url.token';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import {
  Films,
  Rooms,
  Screenings,
  GenreInfo,
} from '../../projects/auth/src/lib/interfaces/staff-interfaces';

describe('StaffActionsService', () => {
  let service: StaffActionsService;
  let httpMock: HttpTestingController;
  const mockApiUrl = environment.apiURL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StaffActionsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: mockApiUrl },
      ],
    });
    service = TestBed.inject(StaffActionsService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    httpMock.verify();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFilmsList', () => {
    it('should return film list on success', () => {
      const mockFilms: Films[] = [
        {
          filmId: 1,
          filmTitle: 'Inception',
          filmDescription: 'A mind-bending thriller',
          filmImg: 'https://example.com/inception.webp',
          filmDuration: 148,
          filmFavorite: true,
          filmMinimumAge: 13,
          filmActiveDate: '2023-01-01',
          genreFilms: [{ genreId: 1, genreType: 'Sci-Fi' }] as GenreInfo[],
        } as Films,
      ];
      const mockResponse = { success: true, data: mockFilms };
      service.getFilmsList().subscribe(result => {
        expect(result).toEqual({ Films: mockFilms });
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush(mockResponse);
    });

    it('should return empty array on API failure', () => {
      const mockResponse = { success: false, error: { message: 'Error' } };
      service.getFilmsList().subscribe(result => {
        expect(result).toEqual({ Films: [] });
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films`);
      req.flush(mockResponse);
    });

    it('should handle network error gracefully', () => {
      service.getFilmsList().subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addFilm', () => {
    it('should return true if film added successfully', () => {
      const filmData = { title: 'Tenet' } as unknown as Partial<Films>;
      const mockResponse = { success: true };
      service.addFilm(filmData).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush(mockResponse);
    });

    it('should return false on failure', () => {
      const filmData = { title: 'Tenet' } as unknown as Partial<Films>;
      service.addFilm(filmData).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.addFilm({}).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateFilm', () => {
    it('should return true on successful update', () => {
      const filmData = { title: 'Updated' } as unknown as Partial<Films>;
      service.updateFilm(1, filmData, [1, 2]).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.updateFilm(1, {}, []).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films/1`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.updateFilm(1, {}, []).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films/1`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deactivateFilm', () => {
    it('should return true if film deactivated', () => {
      service.deactivateFilm(1).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on error', () => {
      service.deactivateFilm(1).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films/1`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.deactivateFilm(1).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/films/1`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ---- Rooms ----
  describe('getRoomsList', () => {
    it('should return room list on success', () => {
      const mockRooms: Rooms[] = [{ roomId: 1, roomNumber: 1 } as Rooms];
      const mockResponse = { success: true, data: mockRooms };
      service.getRoomsList(5).subscribe(result => {
        expect(result).toEqual({ Rooms: mockRooms });
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/5`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush(mockResponse);
    });

    it('should return empty array on API failure', () => {
      const mockResponse = { success: false, error: { message: 'Error' } };
      service.getRoomsList(5).subscribe(result => {
        expect(result).toEqual({ Rooms: [] });
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/5`);
      req.flush(mockResponse);
    });

    it('should return null on network error', () => {
      service.getRoomsList(5).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/5`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addRoom', () => {
    it('should return true if room added successfully', () => {
      service.addRoom({ roomNumber: 1 }).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.addRoom({ roomNumber: 1 }).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.addRoom({ roomNumber: 1 }).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateRoom', () => {
    it('should return true on successful update', () => {
      service.updateRoom(1, { roomNumber: 2 }, 10, 10).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.updateRoom(1, {}, 10, 10).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/1`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.updateRoom(1, {}, 10, 10).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/1`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deactivateRoom', () => {
    it('should return true if room deactivated', () => {
      service.deactivateRoom(1).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.deactivateRoom(1).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/1`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.deactivateRoom(1).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/rooms/1`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ---- Screenings ----
  describe('getScreeningsList', () => {
    it('should return screenings list on success', () => {
      const mockScreenings: Screenings[] = [{ screeningId: 1, filmId: 1, roomId: 1 } as Screenings];
      const mockResponse = { success: true, data: mockScreenings };
      service.getScreeningsList(1, 1, 1).subscribe(result => {
        expect(result).toEqual({ Screenings: mockScreenings });
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1/1/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush(mockResponse);
    });

    it('should return empty list on API failure', () => {
      const mockResponse = { success: false, error: { message: 'Error' } };
      service.getScreeningsList(1, 1, 1).subscribe(result => {
        expect(result).toEqual({ Screenings: [] });
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1/1/1`);
      req.flush(mockResponse);
    });

    it('should return null on network error', () => {
      service.getScreeningsList(1, 1, 1).subscribe(result => {
        expect(result).toBeNull();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1/1/1`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addScreening', () => {
    it('should return true if screening added successfully', () => {
      service.addScreening({ screeningId: 1 }).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.addScreening({ screeningId: 1 }).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.addScreening({ screeningId: 1 }).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateScreening', () => {
    it('should return true on successful update', () => {
      service.updateScreening(1, { filmId: 2 }).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.updateScreening(1, {}).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1`);
      req.flush({ success: false });
    });

    it('should log and return false on network error', () => {
      const spy = jest.spyOn(console, 'error');
      service.updateScreening(1, {}).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1`);
      req.error(new ProgressEvent('network error'));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deactivateScreening', () => {
    it('should return true if screening deactivated', () => {
      service.deactivateScreening(1).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false on failure', () => {
      service.deactivateScreening(1).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1`);
      req.flush({ success: false });
    });
  });

  it('should log and return false on network error', () => {
    const spy = jest.spyOn(console, 'error');
    service.deactivateScreening(1).subscribe(result => {
      expect(result).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/staff/screenings/1`);
    req.error(new ProgressEvent('network error'));
    expect(console.error).toHaveBeenCalled();
  });
});
