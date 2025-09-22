import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { ReservationComponent } from '../../projects/cinephoria-web/src/app/features/reservation/reservation.component';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
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
import {
  Seat,
  SavedReservation,
} from '../../projects/cinephoria-web/src/app/interfaces/reservation';
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

  const mockScreening = {
    screeningId: 1,
    cinemaId: 1,
    filmId: 1,
    roomId: 1,
    screeningDate: '2025-07-15',
    startTime: '14:00',
    endTime: '16:10',
    quality: 'IMAX',
    price: 12.5,
    screeningStatus: 'active',
  } as const;

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
    screeningId: 10,
    seatCount: 2,
    selectedSeats: [mockSeats[0], mockSeats[1]],
    selectedSeatLabels: 'A1, A2',
    selectedScreening: [mockExtendedScreening],
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

  it('should load the initial state', () => {
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('should set the properties on init', () => {
    (mockReservationService.getSavedReservation as jest.Mock).mockReturnValue(null);
    (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
    component.ngOnInit();
    expect(component.selectedCinemaId).toBe(null);
    expect(component.selectedFilmId).toBe(null);
    expect(component.seances).toEqual([]);
    expect(component.filteredScreenings).toEqual([]);
  });

  it('should confirm user is authenticated on init', async () => {
    isAuthenticatedSubject.next(true);
    component.ngOnInit();
    await fixture.whenStable();
    expect(component.isAuthenticated).toBe(true);
  });

  it('should confirm user is NOT authenticated on init', async () => {
    isAuthenticatedSubject.next(false);
    component.ngOnInit();
    await fixture.whenStable();
    expect(component.isAuthenticated).toBe(false);
  });

  it('should load the saved screening selection and redirect the user to complete the reservation if available', async () => {
    (mockReservationService.setSelectedScreening as jest.Mock).mockImplementation(
      () => mockScreening,
    );
    (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(mockScreening);
    jest.spyOn(component, 'onFilterChange').mockImplementation(() => {});
    jest.spyOn(component, 'loadSeatSelection').mockImplementation(() => {});
    component.ngOnInit();
    expect(component.filtersNeeded).toBe(false);
    expect(component.selectedCinemaId).toBe(mockScreening.cinemaId);
    expect(component.selectedFilmId).toBe(mockScreening.filmId);
    expect(component.selectedScreeningId).toBe(mockScreening.screeningId);
    expect(component.onFilterChange).toHaveBeenCalled();
    expect(component.screeningSelected).toBe(true);
    expect(component.loadSeatSelection).toHaveBeenCalled();
  });

  it('should load the saved reservation selection if available and user is authenticated', async () => {
    (mockReservationService.saveCurrentReservation as jest.Mock).mockImplementation(
      () => mockSavedReservation,
    );
    (mockReservationService.getSavedReservation as jest.Mock).mockReturnValue(mockSavedReservation);
    (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    isAuthenticatedSubject.next(true);
    component.ngOnInit();
    await fixture.whenStable();
    expect(component.isAuthenticated).toBe(true);
    expect(mockReservationService.getSavedReservation).toHaveBeenCalled();
    expect(component.filtersNeeded).toBe(false);
    expect(component.selectedCinemaId).toBe(mockSavedReservation.cinemaId);
    expect(component.selectedFilmId).toBe(mockSavedReservation.filmId);
    expect(component.selectedScreeningId).toBe(mockSavedReservation.screeningId);
    expect(component.screeningSelected).toBe(true);
    expect(component.seances).toEqual(mockSavedReservation.selectedScreening);
    expect(component.selectedSeatCount).toBe(mockSavedReservation.seatCount);
    expect(component.selectedSeats).toEqual(mockSavedReservation.selectedSeats);
    expect(component.seatSelector.selectedSeatIds.size).toBe(
      mockSavedReservation.selectedSeats.length,
    );
    expect(component.selectedSeatLabels).toBe(mockSavedReservation.selectedSeatLabels);
  });

  it('should handle error when loading cinema filter', () => {
    (mockCinemaInfoService.getCinemaInfo as jest.Mock).mockReturnValue(
      throwError(() => new Error('Failed')),
    );
    component['loadFilters']();
    expect(console.error).toHaveBeenCalledWith('Failed to load cinemas', expect.any(Error));
  });

  it('should handle error when loading film info', () => {
    (mockFilmInfoService.getFilmInfo as jest.Mock).mockReturnValue(
      throwError(() => new Error('Failed')),
    );
    component['loadFilters']();
    expect(console.error).toHaveBeenCalledWith('Failed to load films', expect.any(Error));
  });

  it('should handle filter changes and load screenings', () => {
    component.selectedCinemaId = 1;
    component.selectedFilmId = 12;
    component.onFilterChange();
    expect(component.filtersNeeded).toBe(false);
    expect(component.selectedSeatCount).toBe(null);
    expect(component.selectedSeats).toEqual([]);
    expect(component.showSeatingPlan).toBe(false);
    expect(component.totalPrice).toBe(0);
    expect(component.filteredScreenings).toEqual([]);
    expect(component.seances).toEqual([]);
    expect(component.hasError).toBe(false);
    expect(component.isLoading).toBe(false);
    expect(mockFilmInfoService.getFilmById).toHaveBeenCalled();
  });

  it('should handle error when loading filtered screenings', () => {
    component.selectedCinemaId = 1;
    component.selectedFilmId = 12;
    (mockFilmInfoService.getFilmById as jest.Mock).mockReturnValue(
      throwError(() => new Error('Failed')),
    );
    component['loadFilteredScreenings']();
    expect(component.hasError).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('should handle error when loading extended screenings', () => {
    (mockReservationService.getExtendedScreening as jest.Mock).mockImplementation(() => {
      throwError(() => new Error('Failed'));
    });
    component['loadExtendedScreenings']([mockScreening], 120);
    expect(component.hasError).toBe(true);
  });

  it('should set selected screening when onSelectedScreening is called', () => {
    jest.spyOn(component, 'loadSeatSelection').mockImplementation(() => {});
    component.onSelectedScreening(mockExtendedScreening);
    expect(mockReservationService.setSelectedScreening).toHaveBeenCalledWith(mockExtendedScreening);
    expect(component.selectedScreeningId).toBe(mockExtendedScreening.screeningId);
    expect(component.screeningSelected).toBe(true);
    expect(component.loadSeatSelection).toHaveBeenCalled();
  });

  it('should handle loadSeatSelection with no screening', () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(null);
    component.loadSeatSelection();
    expect(component.hasSeatingError).toBe(false);
  });

  it('should return early if no screening is selected when loadSeatSelection is called', () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(null);
    component.loadSeatSelection();
    expect(console.warn).toHaveBeenCalledWith('No screening selected for seat selection.');
    expect(component.seats).toEqual([]);
  });

  it('should load seats successfully and call scroll and seat handlers', () => {
    const expectedSeats = mockSeats.map(seat => ({ ...seat, isSelected: true }));
    component.seatCountSection = { nativeElement: { scrollIntoView: jest.fn() } } as ElementRef;
    component.selectedSeatCount = 2;
    component.selectedSeats = mockSeats;
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(
      mockExtendedScreening,
    );
    (mockReservationService.getScreeningSeats as jest.Mock).mockReturnValue(of(mockSeats));
    jest.spyOn(component, 'scrollToSection');
    jest.spyOn(component, 'onSeatCountChange');
    jest.spyOn(component, 'onSeatsSelected');
    component.loadSeatSelection();
    expect(component.hasSeatingError).toBe(false);
    expect(component.seats).toEqual(expectedSeats);
    expect(component.scrollToSection).toHaveBeenCalledWith(component.seatCountSection);
    expect(component.onSeatCountChange).toHaveBeenCalled();
    expect(component.onSeatsSelected).toHaveBeenCalledWith(mockSeats);
  });

  it('should handle empty seat array', () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(
      mockExtendedScreening,
    );
    (mockReservationService.getScreeningSeats as jest.Mock).mockReturnValue(of([]));
    component.loadSeatSelection();
    expect(console.warn).toHaveBeenCalledWith('No seats available for the selected screening.');
    expect(component.hasSeatingError).toBe(true);
    expect(component.seats).toEqual([]);
  });

  it('should handle error when loading seats', () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(
      mockExtendedScreening,
    );
    (mockReservationService.getScreeningSeats as jest.Mock).mockReturnValue(
      throwError(() => new Error('Failed to load seats')),
    );
    component.loadSeatSelection();
    expect(console.error).toHaveBeenCalledWith('Error loading screening seats:', expect.any(Error));
    expect(component.hasSeatingError).toBe(true);
  });

  it('should calculate total price after seats selected and scroll onto the recap section', async () => {
    component.priceSummarySection = { nativeElement: { scrollIntoView: jest.fn() } };
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue({
      ...mockExtendedScreening,
      price: 10,
    });
    component.selectedSeatCount = 2;
    component.seats = mockSeats;
    component.onSeatsSelected(mockSeats);
    expect(component.selectedSeats).toEqual(mockSeats);
    expect(component.selectedSeatLabels).toBe('A1, A2');
    expect(mockReservationService.getSelectedScreening).toHaveBeenCalled();
    expect(component.totalPrice).toBe(20);
    expect(component.selectedSeatLabels).toBe('A1, A2');
    jest.useRealTimers();
    await component.priceSummarySection.nativeElement.scrollIntoView();
    expect(component.priceSummarySection.nativeElement.scrollIntoView).toHaveBeenCalled();
  });

  it('should return correct recapDetails', () => {
    component.cinemas = [{ id: 1, name: 'Cinema 1' }];
    component.filteredFilms = [{ id: 12, name: 'Film 12' }];
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue({
      ...mockExtendedScreening,
      screeningDate: new Date('2025-08-27T17:00:00Z'),
    });
    component.film = { filmDuration: 120 } as FilmInfo;
    component.selectedCinemaId = 1;
    component.selectedFilmId = 12;
    const recap = component.recapDetails;
    expect(recap.cinema).toBe('Cinema 1');
    expect(recap.film).toBe('Film 12');
    expect(recap.seance).toBe(new Date('2025-08-27T17:00:00Z').toLocaleDateString('fr-FR'));
    expect(recap.duration).toBe(120);
  });
});
