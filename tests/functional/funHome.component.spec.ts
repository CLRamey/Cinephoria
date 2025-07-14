import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from '../../projects/cinephoria-web/src/app/features/home/home.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film.ts';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: FilmInfoService, useValue: { getFilmInfo: jest.fn() } },
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should load films successfully and filter latest films by last Wednesday', () => {
    const lastWednesday = component['getLastWednesday']();
    const mockFilms: FilmInfo[] = [
      {
        filmId: 1,
        filmTitle: 'Test Film Title',
        filmDescription: 'Test film description for testing purposes.',
        filmImg: 'TestFilmImage.webp',
        filmDuration: 148,
        filmFavorite: true,
        filmMinimumAge: 12,
        filmActiveDate: lastWednesday.toISOString(), // Set the date to last Wednesday
        filmPublishingState: 'active',
        filmAverageRating: 4.7,
      },
      {
        filmId: 2,
        filmTitle: 'Old Film',
        filmDescription: 'Should not match',
        filmImg: 'OldFilmImage.webp',
        filmDuration: 90,
        filmFavorite: false,
        filmMinimumAge: 16,
        filmActiveDate: '2025-07-01', // Date that doesn't match
        filmPublishingState: 'archived',
        filmAverageRating: 3.5,
      },
    ];
    const filmInfoService = TestBed.inject(FilmInfoService);
    (filmInfoService.getFilmInfo as jest.Mock).mockReturnValue(of({ FilmInfo: mockFilms }));
    component['loadFilms']();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBeNull();
    expect(component.films.length).toBe(2);
    expect(component.latestFilms.length).toBe(1);
    expect(component.latestFilms[0].filmTitle).toBe('Test Film Title');
  });

  it('should return last Wednesday with time set to 00:00:00', () => {
    const wednesday = component['getLastWednesday']();
    expect(wednesday.getDay()).toBe(3);
    expect(wednesday.getHours()).toBe(0);
    expect(wednesday.getMinutes()).toBe(0);
    expect(wednesday.getSeconds()).toBe(0);
  });
});
