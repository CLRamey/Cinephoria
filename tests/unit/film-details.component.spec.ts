import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { RoomInfoService } from '../../projects/cinephoria-web/src/app/services/room-info.service';
import { FilmDetailsComponent } from '../../projects/cinephoria-web/src/app/features/films/film-details/film-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ExtendedScreening } from '../../projects/cinephoria-web/src/app/interfaces/screening';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { RoomInfo } from '../../projects/cinephoria-web/src/app/interfaces/room';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';

describe('FilmDetailsComponent', () => {
  let component: FilmDetailsComponent;
  let fixture: ComponentFixture<FilmDetailsComponent>;

  let mockFilmInfoService: jest.Mocked<FilmInfoService>;
  let mockRoomInfoService: jest.Mocked<RoomInfoService>;
  let mockRouter: jest.Mocked<Router>;
  let mockReservationService: jest.Mocked<ReservationService>;

  const mockActivatedRoute = {
    paramMap: of(convertToParamMap({ filmId: '12' })),
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'filmId' ? '12' : null),
      },
    },
  } as unknown as ActivatedRoute;

  const mockFilmData = [
    {
      filmId: 12,
      filmTitle: 'The Great Adventure',
      filmDescription: 'An epic journey of discovery and survival.',
      filmImg: 'great-adventure.webp',
      filmDuration: 120,
      filmMinimumAge: 12,
      filmActiveDate: '2025-07-01',
      filmPublishingState: 'active',
      filmAverageRating: 4.5,
      genreFilms: [
        {
          genreId: 1,
          filmId: 12,
          genre: {
            genreId: 1,
            genreType: 'Adventure',
          },
        },
      ],
      cinemaFilms: [
        {
          cinemaId: 1,
          filmId: 12,
          cinema: {
            cinemaId: 1,
            cinemaName: 'Cinéphoria Central',
          },
        },
      ],
      screenings: [
        {
          screeningId: 10,
          screeningDate: '2025-07-10T15:00:00Z',
          screeningStatus: 'active',
          roomId: 5,
          filmId: 12,
          cinemaId: 1,
        },
      ],
    },
  ];
  const mockRoomData = [
    {
      roomId: 5,
      roomNumber: 1,
      roomCapacity: 100,
      qualityId: 4,
      cinemaId: 1,
      quality: {
        qualityId: 4,
        qualityProjectionType: 'IMAX',
        qualityProjectionPrice: 15.5,
      },
      cinema: {
        cinemaId: 1,
        cinemaName: 'Cinéphoria Central',
      },
    },
  ];
  const mockExtendedScreening: ExtendedScreening = {
    screeningId: 10,
    screeningDate: new Date(Date.now() + 1000 * 60 * 60),
    screeningStatus: 'active',
    cinemaId: 1,
    filmId: 12,
    roomId: 5,
    startTime: '17:00',
    endTime: '19:00',
    quality: 'IMAX',
    price: 15.5,
    room: { roomId: 5, roomNumber: 1 },
  };

  beforeEach(async () => {
    mockFilmInfoService = {
      getFilmById: jest.fn().mockReturnValue(of(mockFilmData as FilmInfo[])),
    } as unknown as jest.Mocked<FilmInfoService>;

    mockRoomInfoService = {
      getRoomById: jest.fn().mockReturnValue(of(mockRoomData as RoomInfo[])),
    } as unknown as jest.Mocked<RoomInfoService>;

    mockReservationService = {
      getExtendedScreening: jest.fn().mockReturnValue(of([])),
      createExtendedScreening: jest.fn().mockReturnValue(of({})),
      setSelectedScreening: jest.fn(),
    } as unknown as jest.Mocked<ReservationService>;

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      declarations: [FilmDetailsComponent],
      providers: [
        { provide: FilmInfoService, useValue: mockFilmInfoService },
        { provide: RoomInfoService, useValue: mockRoomInfoService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: 'ViewportScroller',
          useValue: {
            scrollToPosition: jest.fn(),
            scrollToAnchor: jest.fn(),
          },
        },
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmDetailsComponent);
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

  it('should call ngOnInit and load film data', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filmId).toBe(12);
    expect(mockFilmInfoService.getFilmById).toHaveBeenCalledWith(12);
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBeNull();
    expect(component.film).toEqual(mockFilmData[0]);
  });

  it('should load the screenings and set seances for the films', () => {
    mockReservationService.getExtendedScreening.mockReturnValue(of(mockExtendedScreening));
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockReservationService.getExtendedScreening).toHaveBeenCalled();
    expect(component.seances.length).toBe(1);
    expect(component.seances[0].screeningId).toBe(10);
    expect(component.seances[0].startTime).toBe('17:00');
    expect(component.seances[0].endTime).toBe('19:00');
    expect(component.seances[0].quality).toBe('IMAX');
    expect(component.seances[0].price).toBe(15.5);
    expect(component.isLoading).toBe(false);
  });

  it('should handle errors correctly for loading film data', () => {
    mockFilmInfoService.getFilmById.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.hasError).toBe('Erreur lors du chargement du film.');
    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading films:', expect.any(Error));
  });

  it('should handle errors correctly for loading screenings', () => {
    mockFilmInfoService.getFilmById.mockReturnValue(of(mockFilmData as FilmInfo[]));
    mockRoomInfoService.getRoomById.mockReturnValue(throwError(() => new Error('fail')));
    mockReservationService.getExtendedScreening.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockReservationService.getExtendedScreening).toHaveBeenCalled();
    expect(component.hasError).toBe('Erreur lors du chargement des séances.');
    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error loading screenings:', expect.any(Error));
  });

  it('should navigate to reservation page with correct params on onReserveScreening()', () => {
    const extended: ExtendedScreening = {
      screeningId: 12,
      screeningDate: new Date('2025-07-10T15:00:00Z'),
      screeningStatus: 'active',
      cinemaId: 3,
      filmId: 5,
      roomId: 6,
      startTime: '14:00',
      endTime: '16:00',
      quality: '4K',
      price: 11.5,
    };
    component.onReserveScreening(extended);
    expect(mockReservationService.setSelectedScreening).toHaveBeenCalledWith(extended);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reservation']);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
