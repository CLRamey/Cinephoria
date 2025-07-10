import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmDetailsComponent } from '../../projects/cinephoria-web/src/app/features/films/film-details/film-details.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app//services/film-info.service';
import { RoomInfoService } from '../../projects/cinephoria-web/src/app/services/room-info.service';
import { RoomInfo } from '../../projects/cinephoria-web/src/app/interfaces/room';
import { ExtendedScreening } from '../../projects/cinephoria-web/src/app/interfaces/screening';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

// Patch the ExtendedScreening type for test to include full RoomInfo
type ExtendedScreeningWithRoom = Omit<ExtendedScreening, 'room'> & { room?: RoomInfo };

describe('FilmDetailsComponent (Functional)', () => {
  let component: FilmDetailsComponent;
  let fixture: ComponentFixture<FilmDetailsComponent>;

  let mockRoomInfoService: Partial<RoomInfoService>;
  let mockFilmInfoService: Partial<FilmInfoService>;

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

  beforeEach(async () => {
    mockFilmInfoService = {
      getFilmById: jest.fn().mockReturnValue(of(mockFilmData)),
    } as Partial<FilmInfoService> as FilmInfoService;

    mockRoomInfoService = {
      getRoomById: jest.fn().mockReturnValue(of(mockRoomData)),
    } as Partial<RoomInfoService> as RoomInfoService;

    await TestBed.configureTestingModule({
      declarations: [FilmDetailsComponent],
      providers: [
        { provide: FilmInfoService, useValue: mockFilmInfoService },
        { provide: RoomInfoService, useValue: mockRoomInfoService },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '12' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmDetailsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should fetch film and screening data on init', () => {
    component.ngOnInit();
    expect(mockFilmInfoService.getFilmById).toHaveBeenCalledWith(12);
    expect(component.film?.filmId).toEqual(12);
    expect(component.seances.length).toBeGreaterThan(0);
  });

  it('should correctly create an extended screening with full room, quality, and calculated times', () => {
    component.ngOnInit();
    const seance = component.seances[0] as ExtendedScreeningWithRoom;
    expect(seance.screeningId).toBe(10);
    expect(seance.screeningDate.toISOString()).toBe('2025-07-10T15:00:00.000Z');
    expect(seance.cinemaId).toBe(1);
    expect(seance.filmId).toBe(12);
    expect(seance.roomId).toBe(5);
    expect(seance.startTime).toBeDefined();
    expect(seance.endTime).toBeDefined();
    expect(seance.quality).toBe('IMAX');
    expect(seance.price).toBe(15.5);
  });
});
