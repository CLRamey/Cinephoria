import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmsComponent } from '../../projects/cinephoria-web/src/app/features/films/films.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { GenreInfoService } from '../../projects/cinephoria-web/src/app/services/genre-info.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('FilmsComponent', () => {
  let component: FilmsComponent;
  let fixture: ComponentFixture<FilmsComponent>;
  // Mock services
  let mockFilmInfoService: jest.Mocked<FilmInfoService>;
  let mockCinemaInfoService: jest.Mocked<CinemaInfoService>;
  let mockGenreInfoService: jest.Mocked<GenreInfoService>;
  let mockRouter: jest.Mocked<Router>;

  const mockActivatedRoute = {
    params: of({ filmId: 123 }),
    snapshot: {
      paramMap: {
        get: (_key: string) => '123',
      },
    },
  };

  beforeEach(async () => {
    mockFilmInfoService = {
      getFilmInfo: jest.fn(),
      getFilmById: jest.fn(),
    } as unknown as jest.Mocked<FilmInfoService>;

    mockCinemaInfoService = {
      getCinemaInfo: jest.fn(),
      getCinemaById: jest.fn(),
    } as unknown as jest.Mocked<CinemaInfoService>;

    mockGenreInfoService = {
      getGenreInfo: jest.fn(),
      getGenreById: jest.fn(),
    } as unknown as jest.Mocked<GenreInfoService>;

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      declarations: [FilmsComponent],
      providers: [
        { provide: FilmInfoService, useValue: mockFilmInfoService },
        { provide: CinemaInfoService, useValue: mockCinemaInfoService },
        { provide: GenreInfoService, useValue: mockGenreInfoService },
        { provide: Router, useValue: mockRouter },
        { provide: 'ActivatedRoute', useValue: mockActivatedRoute },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmsComponent);
    component = fixture.componentInstance;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load films and filters on ngOnInit', () => {
    mockFilmInfoService.getFilmInfo.mockReturnValue(of({ FilmInfo: [] }));
    mockCinemaInfoService.getCinemaInfo.mockReturnValue(of({ CinemaInfo: [] }));
    mockGenreInfoService.getGenreInfo.mockReturnValue(of([]));

    component.ngOnInit();
    fixture.detectChanges();
    expect(mockFilmInfoService.getFilmInfo).toHaveBeenCalled();
    expect(mockCinemaInfoService.getCinemaInfo).toHaveBeenCalled();
    expect(mockGenreInfoService.getGenreInfo).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBeNull();
  });

  it('should handle film loading error', () => {
    mockFilmInfoService.getFilmInfo.mockReturnValue(throwError(() => new Error('Film error')));
    mockCinemaInfoService.getCinemaInfo.mockReturnValue(of({ CinemaInfo: [] }));
    mockGenreInfoService.getGenreInfo.mockReturnValue(of([]));

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.hasError).toBe('Erreur lors du chargement des films');
    expect(console.error).toHaveBeenCalledWith('Failed to load films', expect.any(Error));
  });

  it('should handle cinema loading error', () => {
    mockFilmInfoService.getFilmInfo.mockReturnValue(of({ FilmInfo: [] }));
    mockCinemaInfoService.getCinemaInfo.mockReturnValue(
      throwError(() => new Error('Cinema error')),
    );
    mockGenreInfoService.getGenreInfo.mockReturnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    expect(console.error).toHaveBeenCalledWith('Failed to load cinemas', expect.any(Error));
  });

  it('should handle genre loading error', () => {
    mockFilmInfoService.getFilmInfo.mockReturnValue(of({ FilmInfo: [] }));
    mockCinemaInfoService.getCinemaInfo.mockReturnValue(of({ CinemaInfo: [] }));
    mockGenreInfoService.getGenreInfo.mockReturnValue(throwError(() => new Error('Genre error')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(console.error).toHaveBeenCalledWith('Failed to load genres', expect.any(Error));
  });

  it('should track films by filmId', () => {
    const film = { filmId: 123 } as FilmInfo;
    const result = component.trackByFilmId(0, film);
    expect(result).toBe(123);
  });

  it('should call router.navigate on onFilmSelected()', () => {
    const film = { filmId: 123 } as FilmInfo;
    component.onFilmSelected(film);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/films/123']);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
