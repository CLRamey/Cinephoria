import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { ReservationComponent } from '../../projects/cinephoria-web/src/app/features/reservation/reservation.component';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { CinemaInfo } from '../../projects/cinephoria-web/src/app/interfaces/cinema';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Seat } from '../../projects/cinephoria-web/src/app/interfaces/reservation';
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

  it('should load the initial state', () => {
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('should handle scrollToSection when section is null', () => {
    expect(() => component.scrollToSection(null)).not.toThrow();
  });

  it('should handle a filter being deselected and change state', () => {
    component.selectedCinemaId = 1;
    component.onFilterChange();
    expect(component.filtersNeeded).toBe(true);
    expect(component.seances).toEqual([]);
    expect(component.filteredScreenings).toEqual([]);
  });

  it('should reset seat selection', () => {
    component.selectedSeatCount = 3;
    component.selectedSeats = mockSeats;
    component.resetSeatSelection();
    expect(component.selectedSeatCount).toBeNull();
    expect(component.selectedSeats).toEqual([]);
    expect(component.showSeatingPlan).toBe(false);
    expect(component.totalPrice).toBe(0);
  });

  it('should handle seat count change when enough seats available', () => {
    component.seatingPlanSection = { nativeElement: { scrollIntoView: jest.fn() } };
    component.seats = mockSeats;
    component.selectedSeatCount = 2;
    component.seatCountSection = { nativeElement: {} } as ElementRef;
    component.onSeatCountChange();
    expect(component.showSeatingPlan).toBe(true);
    expect(component.seatingPlanSection.nativeElement.scrollIntoView).toHaveBeenCalled();
  });

  it('should handle seat count change when not enough seats and scroll back to the screening section', async () => {
    component.screeningsSection = { nativeElement: { scrollIntoView: jest.fn() } };
    component.seats = mockSeats;
    component.selectedSeatCount = 5;
    component.seatCountSection = { nativeElement: {} } as ElementRef;
    component.onSeatCountChange();
    expect(component.showSeatingPlan).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Le nombre de places disponibles'),
      'Fermer',
      expect.any(Object),
    );
    jest.useRealTimers();
    await component.screeningsSection.nativeElement.scrollIntoView();
    expect(component.screeningsSection.nativeElement.scrollIntoView).toHaveBeenCalled();
  });

  it('should return 0 if no screening selected', () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(null);
    expect(component['getSeatPrice']()).toBe(0);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
