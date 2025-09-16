import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationComponent } from '../../projects/cinephoria-web/src/app/features/reservation/reservation.component';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { CinemaInfo } from '../../projects/cinephoria-web/src/app/interfaces/cinema';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReserveResponse } from '../../projects/cinephoria-web/src/app/interfaces/reservation';
import { Seat } from '../../projects/cinephoria-web/src/app/interfaces/reservation';
import { ExtendedScreening } from '../../projects/cinephoria-web/src/app/interfaces/screening';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';

describe('ReservationComponent', () => {
  let component: ReservationComponent;
  let fixture: ComponentFixture<ReservationComponent>;

  const isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  const userRoleSubject: BehaviorSubject<Role | null> = new BehaviorSubject<Role | null>(null);

  let mockCinemaInfoService: Partial<CinemaInfoService>;
  let mockFilmInfoService: Partial<FilmInfoService>;
  let mockReservationService: Partial<ReservationService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;
  let mockAuthService: Partial<AuthService>;
  let mockSnackBar: Partial<MatSnackBar>;

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
  const mockSuccessResponse: ReserveResponse = {
    success: true,
    error: undefined,
  };
  const mockFailedResponse: ReserveResponse = {
    success: false,
    error: 'Reservation failed',
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      userRole$: userRoleSubject.asObservable(),
      isAuthenticated: jest.fn(),
      getUserRole: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    mockFilmInfoService = {
      getFilmInfo: jest.fn().mockReturnValue(of({ FilmInfo: [] })),
      getFilmById: jest.fn().mockReturnValue(of({} as FilmInfo)),
    } as Partial<FilmInfoService>;

    mockCinemaInfoService = {
      getCinemaInfo: jest.fn().mockReturnValue(of({ CinemaInfo: [] })),
      getCinemaById: jest.fn().mockReturnValue(of({} as CinemaInfo)),
    } as Partial<CinemaInfoService>;

    mockReservationService = {
      setSelectedScreening: jest.fn(),
      getSelectedScreening: jest.fn(),
      clearSelectedScreening: jest.fn(),
      getExtendedScreening: jest.fn(),
      createExtendedScreening: jest.fn(),
      getScreeningSeats: jest.fn().mockReturnValue(of([])),
      saveCurrentReservation: jest.fn(),
      getSavedReservation: jest.fn(),
      makeReservation: jest.fn(),
    } as Partial<ReservationService>;

    mockSnackBar = {
      open: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn(),
        },
      },
      queryParamMap: of({
        get: jest.fn(),
      }),
    } as unknown as jest.Mocked<ActivatedRoute>;

    await TestBed.configureTestingModule({
      declarations: [ReservationComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDividerModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: ReservationService, useValue: mockReservationService },
        { provide: FilmInfoService, useValue: mockFilmInfoService },
        { provide: CinemaInfoService, useValue: mockCinemaInfoService },
        { provide: Router, useValue: mockRouter },
        {
          provide: 'ViewportScroller',
          useValue: {
            scrollToPosition: jest.fn(),
            scrollToAnchor: jest.fn(),
          },
        },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the login page when redirectToLogin is called', () => {
    component.redirectToLogin();
    expect(mockReservationService.getSelectedScreening).toHaveBeenCalled();
    expect(mockReservationService.saveCurrentReservation).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login-client'], expect.any(Object));
  });

  it('should redirect to the create an account page when redirectToSignup is called', () => {
    component.redirectToSignup();
    expect(mockReservationService.getSelectedScreening).toHaveBeenCalled();
    expect(mockReservationService.saveCurrentReservation).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/login-client/register'],
      expect.any(Object),
    );
  });

  it('should redirect to login if not authenticated on confirmReservation', () => {
    (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
    component.confirmReservation();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login-client'], expect.any(Object));
  });

  it('should open snackbar if confirming reservation without selected seats or screening', () => {
    component.isAuthenticated = true;
    component.selectedScreeningId = null;
    component.selectedSeats = [];
    component.confirmReservation();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Veuillez sélectionner une séance et des sièges'),
      'Fermer',
      expect.any(Object),
    );
  });

  it('should confirm reservation successfully', () => {
    component.isAuthenticated = true;
    component.selectedScreeningId = mockExtendedScreening.screeningId;
    component.selectedSeats = mockSeats;
    (mockReservationService.makeReservation as jest.Mock).mockReturnValue(of(mockSuccessResponse));
    component.confirmReservation();
    expect(component.isLoading).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Votre réservation est confirmée'),
      'Fermer',
      expect.any(Object),
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/client']);
  });

  it('should handle failed reservation', () => {
    component.isAuthenticated = true;
    component.selectedScreeningId = mockExtendedScreening.screeningId;
    component.selectedSeats = mockSeats;
    (mockReservationService.makeReservation as jest.Mock).mockReturnValue(of(mockFailedResponse));
    component.confirmReservation();
    expect(component.isLoading).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Échec de la réservation. Veuillez réessayer.',
      'Fermer',
      expect.any(Object),
    );
  });

  it('should handle error when reservation request fails', () => {
    component.isAuthenticated = true;
    component.selectedScreeningId = mockExtendedScreening.screeningId;
    component.selectedSeats = mockSeats;
    (mockReservationService.makeReservation as jest.Mock).mockReturnValue(
      throwError(() => new Error('Network error')),
    );
    component.confirmReservation();
    expect(mockReservationService.makeReservation).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error confirming reservation:', expect.any(Error));
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Une erreur est survenue lors de la confirmation de la réservation. Veuillez réessayer plus tard.',
      'Fermer',
      expect.any(Object),
    );
  });
});
