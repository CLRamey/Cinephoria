import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from '../../projects/cinephoria-web/src/app/features/home/home.component';
import { ElementRef } from '@angular/core';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  // Mock services and router
  let mockFilmInfoService: jest.Mocked<FilmInfoService>;
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

    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: FilmInfoService, useValue: mockFilmInfoService },
        { provide: Router, useValue: mockRouter },
        { provide: 'ActivatedRoute', useValue: mockActivatedRoute },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
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

  it('should call load films on init', () => {
    mockFilmInfoService.getFilmInfo.mockReturnValue(of({ FilmInfo: [] }));
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockFilmInfoService.getFilmInfo).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBeNull();
  });

  it('should handle film loading error', () => {
    mockFilmInfoService.getFilmInfo.mockReturnValue(throwError(() => new Error('Film error')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.hasError).toBe('Erreur lors du chargement des films');
    expect(console.error).toHaveBeenCalledWith('Failed to load films', expect.any(Error));
  });

  it('should calculate last Wednesday correctly', () => {
    const date = component['getLastWednesday']();
    expect(date.getDay()).toBe(3); // Wednesday
    expect(date.getHours()).toBe(0);
  });

  it('should navigate to /films when goToAllFilms is called', () => {
    component.goToAllFilms();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/films']);
  });

  it('should navigate to film details page when showFilmDetails is called', () => {
    const film = { filmId: 123 } as FilmInfo;
    component.showFilmDetails(film);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/films/123']);
  });

  it('should scroll left and right', () => {
    const scrollMock = jest.fn();
    component.carousel = {
      nativeElement: {
        scrollBy: scrollMock,
      },
    } as unknown as ElementRef<HTMLDivElement>;
    component.scrollLeft();
    expect(scrollMock).toHaveBeenCalledWith({ left: -320, behavior: 'smooth' });
    component.scrollRight();
    expect(scrollMock).toHaveBeenCalledWith({ left: 320, behavior: 'smooth' });
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
