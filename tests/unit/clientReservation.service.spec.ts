import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClientReservationsService } from '../../projects/auth/src/lib/services/clientReservations.service';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import { API_URL } from '../../projects/auth/src/lib/shared/utils/api-url.token';
import {
  Reservation,
  ReservationSuccessResponse,
  ReservationErrorResponse,
} from '../../projects/auth/src/lib/interfaces/user-interfaces';
import { throwError } from 'rxjs';

describe('ClientReservationsService', () => {
  let service: ClientReservationsService;
  let httpMock: HttpTestingController;
  const mockApiUrl = environment.apiURL;

  const mockReservations: Reservation[] = [
    {
      reservationId: 1,
      userId: 1,
      screeningId: 1,
      reservationTotalPrice: 20,
      reservationStatus: 'reserved',
      reservationQrCode: 'abcd1234efgh5678',
      reservationSeats: [
        {
          reservationId: 1,
          seatId: 101,
          seat: {
            seatId: 101,
            seatRow: 'A',
            seatNumber: 5,
            seatLabel: 'A5',
            pmrSeat: false,
            roomId: 1,
            room: {
              roomId: 1,
              roomNumber: 1,
              roomCapacity: 100,
              qualityId: 1,
              quality: {
                qualityId: 1,
                qualityProjectionType: '2D',
                qualityProjectionPrice: 10,
              },
            },
          },
        },
      ],
      screening: {
        screeningId: 1,
        screeningDate: '2025-08-28T18:30:00Z',
        screeningStatus: 'active',
        cinemaId: 10,
        filmId: 20,
        roomId: 1,
        cinema: { cinemaId: 10, cinemaName: 'Cinema' },
        film: { filmId: 20, filmTitle: 'Film' },
      },
    },
  ];

  const mockSuccessResponse: ReservationSuccessResponse = {
    success: true,
    data: mockReservations,
  };

  const mockErrorResponse: ReservationErrorResponse = {
    success: false,
    error: { message: 'API error' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClientReservationsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: mockApiUrl },
      ],
    });
    service = TestBed.inject(ClientReservationsService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
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

  it('should return an array of reservations', () => {
    service.getUserReservations().subscribe(reservations => {
      expect(reservations).toEqual(mockReservations);
    });
    const req = httpMock.expectOne(`${mockApiUrl}/client-reservations`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSuccessResponse);
  });

  it('should handle error response', () => {
    service.getUserReservations().subscribe({
      next: () => fail('expected an error, not reservations'),
      error: error => {
        expect(error).toEqual(mockErrorResponse);
      },
    });
    const req = httpMock.expectOne(`${mockApiUrl}/client-reservations`);
    expect(req.request.method).toBe('GET');
    req.flush(mockErrorResponse);
  });

  it('should return mapped reservations correctly', () => {
    service.getUserReservations().subscribe(result => {
      expect(result).toBeTruthy();
      const res = result!.reservations[0];
      expect(res.cinemaName).toBe('Cinema');
      expect(res.filmName).toBe('Film');
      expect(res.roomNumber).toBe(1);
      expect(res.seatLabels).toBe('A5');
      expect(res.quantity).toBe(1);
      expect(res.screeningDate).toBe('28/08/2025 18:30');
      expect(res.reservationStage).toBe('Réservé');
      expect(res.reservationCode).toBe('10201ABCD1234'); // cinemaId, filmId, screeningId + first 8 chars of QR code
    });
    const req = httpMock.expectOne(`${mockApiUrl}/client-reservations`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSuccessResponse);
  });

  it('should return null on API error', () => {
    service.getUserReservations().subscribe(result => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${mockApiUrl}/client-reservations`);
    req.flush(mockErrorResponse);
  });

  it('should return empty array if API returns empty data', () => {
    service.getUserReservations().subscribe(result => {
      expect(result).toEqual({ reservations: [] });
    });
    const req = httpMock.expectOne(`${mockApiUrl}/client-reservations`);
    req.flush({ success: true, data: [] });
  });

  it('should handle reservations with missing optional fields gracefully', () => {
    const partialReservation: Reservation[] = [
      {
        reservationId: 2,
        userId: 2,
        screeningId: 2,
        reservationTotalPrice: 15,
        reservationStatus: 'paid',
        reservationQrCode: '',
      },
    ];
    const mockSuccessResponse: ReservationSuccessResponse = {
      success: true,
      data: partialReservation,
    };
    service.getUserReservations().subscribe(result => {
      expect(result).toBeTruthy();
      const res = result!.reservations[0];
      expect(res.cinemaName).toBe('-');
      expect(res.filmName).toBe('-');
      expect(res.roomNumber).toBe(2);
      expect(res.seatLabels).toBe('-');
      expect(res.quantity).toBe(1);
      expect(res.screeningDate).toBe('-');
      expect(res.reservationStage).toBe('Payé');
      expect(res.reservationCode).toBe('XX2XXXXXXXX');
    });
    const req = httpMock.expectOne(`${mockApiUrl}/client-reservations`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSuccessResponse);
  });

  it('should return null and handle errors gracefully', () => {
    const httpClient = TestBed.inject(HttpClient);
    jest
      .spyOn(httpClient, 'get')
      .mockReturnValue(throwError(() => new Error('Simulated network error')));
    service.getUserReservations().subscribe(result => {
      expect(result).toBeNull();
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching user reservations:',
      expect.any(Error),
    );
  });
});
