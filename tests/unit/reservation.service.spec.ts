import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';
import {
  Seat,
  SeatingResponse,
  SeatingErrorResponse,
  SavedReservation,
  ReserveResponse,
  ReserveRequest,
} from '../../projects/cinephoria-web/src/app/interfaces/reservation';
import { RoomInfoService } from '../../projects/cinephoria-web/src/app/services/room-info.service';
import { RoomInfo } from '../../projects/cinephoria-web/src/app/interfaces/room';
import { ExtendedScreening } from '../../projects/cinephoria-web/src/app/interfaces/screening';
import { Screening } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import { of, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  let mockRoomInfoService: jest.Mocked<RoomInfoService>;

  const mockFilmDuration = 120;
  const mockScreening: Screening = {
    screeningId: 10,
    screeningDate: '2025-08-27T17:00:00Z',
    screeningStatus: 'active',
    cinemaId: 1,
    filmId: 12,
    roomId: 5,
  };
  const mockExtendedScreening: ExtendedScreening = {
    screeningId: 10,
    screeningDate: new Date('2025-08-27T17:00:00Z'),
    screeningStatus: 'active' as const,
    cinemaId: 1,
    filmId: 12,
    roomId: 5,
    startTime: '19:00',
    endTime: '21:00',
    quality: 'IMAX',
    price: 15.5,
    room: { roomId: 5, roomNumber: 1 },
  };
  const mockSeats: Seat[] = [
    {
      seatId: 1,
      seatRow: 'A',
      seatNumber: 1,
      pmrSeat: false,
      roomId: 101,
      isReserved: false,
      label: 'A1',
    },
    {
      seatId: 2,
      seatRow: 'A',
      seatNumber: 2,
      pmrSeat: false,
      roomId: 101,
      isReserved: false,
      label: 'A2',
    },
  ];
  const mockSavedReservation: SavedReservation = {
    cinemaId: 1,
    filmId: 12,
    screeningId: mockExtendedScreening.screeningId,
    seatCount: 2,
    selectedSeats: mockSeats,
    selectedSeatLabels: 'A1, A2',
    selectedScreening: [mockExtendedScreening],
  };
  const mockReservingRequest: ReserveRequest = {
    screeningId: 10,
    seatIds: [1, 2],
  };
  const mockRoomData = [
    {
      roomId: 5,
      roomNumber: 1,
      roomCapacity: 100,
      qualityId: 4,
      cinemaId: 1,
      quality: {
        qualityId: 4,
        qualityProjectionType: 'IMAX' as const,
        qualityProjectionPrice: 15.5,
      },
      cinema: {
        cinemaId: 1,
        cinemaName: 'Cinéphoria Central',
      },
    },
  ];

  beforeEach(() => {
    mockRoomInfoService = {
      getRoomById: jest.fn().mockReturnValue(of(mockRoomData as RoomInfo[])),
    } as unknown as jest.Mocked<RoomInfoService>;

    TestBed.configureTestingModule({
      providers: [
        ReservationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: RoomInfoService, useValue: mockRoomInfoService },
      ],
    });
    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set, get and clear selected screening', () => {
    service.setSelectedScreening(mockExtendedScreening);
    expect(service.getSelectedScreening()).toEqual(mockExtendedScreening);
    service.clearSelectedScreening();
    expect(service.getSelectedScreening()).toBeNull();
  });

  it('should get the extended screening information', async () => {
    const result = await firstValueFrom(
      service.getExtendedScreening(mockScreening, mockFilmDuration),
    );
    expect(result).toEqual({
      screeningId: mockScreening.screeningId,
      screeningDate: new Date(mockScreening.screeningDate),
      screeningStatus: mockScreening.screeningStatus,
      cinemaId: mockScreening.cinemaId,
      filmId: mockScreening.filmId,
      roomId: mockScreening.roomId,
      startTime: '19:00',
      endTime: '21:00',
      quality: 'IMAX',
      price: 15.5,
      room: { roomId: 5, roomNumber: 1 },
    });
  });

  it('should create an extended screening object', () => {
    const startDate = new Date(mockScreening.screeningDate);
    const endDate = new Date(startDate.getTime() + mockFilmDuration * 60000);

    const result = service.createExtendedScreening(
      mockScreening,
      startDate,
      endDate,
      mockRoomData[0].quality,
      mockRoomData[0].roomNumber,
    );
    expect(result).toEqual(mockExtendedScreening);
  });

  it('should get seating information for a screening', async () => {
    const mockResponse: SeatingResponse = { success: true, data: mockSeats };
    const promise = firstValueFrom(service.getScreeningSeats(mockScreening.screeningId));
    const req = httpMock.expectOne(
      `${environment.apiURL}/screenings/${mockScreening.screeningId}/seats`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    const result = await promise;
    expect(result).toEqual(mockSeats);
  });

  it('should handle error when getting seating information', async () => {
    const mockErrorResponse: SeatingErrorResponse = {
      success: false,
      error: { message: 'Screening not found' },
    };
    const promise = firstValueFrom(
      service.getScreeningSeats(mockScreening.screeningId).pipe(
        catchError((error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockErrorResponse);
          return of(null);
        }),
      ),
    );
    const req = httpMock.expectOne(
      `${environment.apiURL}/screenings/${mockScreening.screeningId}/seats`,
    );
    req.flush(mockErrorResponse, { status: 404, statusText: 'Not Found' });
    const result = await promise;
    expect(result).toEqual([]);
  });

  it('should save the current reservation data to localStorage', () => {
    (window.localStorage.setItem as jest.Mock).mockClear();
    service.saveCurrentReservation(mockSavedReservation);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'cinephoria_currentReservation',
      JSON.stringify(mockSavedReservation),
    );
  });

  it('should get saved reservations from localStorage', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(mockSavedReservation),
    );
    const result = service.getSavedReservation();
    if (result?.selectedScreening?.length) {
      result.selectedScreening = result.selectedScreening.map(screening => ({
        ...screening,
        screeningDate: new Date(screening.screeningDate),
      }));
    }
    expect(window.localStorage.getItem).toHaveBeenCalledWith('cinephoria_currentReservation');
    expect(result).toEqual(mockSavedReservation);
  });

  it('should return null if no saved reservation in localStorage', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    const result = service.getSavedReservation();
    expect(window.localStorage.getItem).toHaveBeenCalledWith('cinephoria_currentReservation');
    expect(result).toBeNull();
  });

  it('should handle error when saving to localStorage', () => {
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });
    expect(() => service.saveCurrentReservation(mockSavedReservation)).not.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      'Error saving reservation to localStorage:',
      expect.any(Error),
    );
  });

  it('should handle error when retrieving from localStorage', () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });
    const result = service.getSavedReservation();
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'Error retrieving reservation from localStorage:',
      expect.any(Error),
    );
  });

  it('should reserve seats for a screening', async () => {
    const mockResponse: ReserveResponse = {
      success: true,
    };
    const promise = firstValueFrom(
      service.makeReservation(mockReservingRequest.screeningId, mockReservingRequest.seatIds),
    );
    const req = httpMock.expectOne(`${environment.apiURL}/reserve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReservingRequest);
    req.flush(mockResponse);
    const result = await promise;
    expect(result).toEqual(mockResponse);
  });
});
