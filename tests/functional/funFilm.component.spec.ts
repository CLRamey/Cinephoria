import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmsComponent } from '../../projects/cinephoria-web/src/app/features/films/films.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { GenreInfoService } from '../../projects/cinephoria-web/src/app/services/genre-info.service';
import { Router } from '@angular/router';
import { FilmInfo } from '../../projects/cinephoria-web/src/app/interfaces/film';

describe('FilmsComponent (Functional)', () => {
  let component: FilmsComponent;
  let fixture: ComponentFixture<FilmsComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilmsComponent],
      providers: [
        { provide: FilmInfoService, useValue: {} },
        { provide: CinemaInfoService, useValue: {} },
        { provide: GenreInfoService, useValue: {} },
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should apply filters correctly (cinema + genre + date)', () => {
    const today = new Date();
    const film = {
      filmId: 1,
      cinemaFilms: [{ cinemaId: 1 }],
      genreFilms: [{ genreId: 2 }],
      screenings: [{ screeningDate: today.toISOString() }],
    };
    component.films = [film as FilmInfo];
    component.selectedCinemaId = 1;
    component.selectedGenreId = 2;
    component.selectedDate = today;
    component.applyFilters();
    expect(component.filteredFilms.length).toBe(1);
    expect(component.filteredFilms[0].filmId).toBe(1);
  });

  it('should navigate to film details on film selection', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const film = { filmId: 123 } as FilmInfo;
    component.onFilmSelected(film);
    expect(navigateSpy).toHaveBeenCalledWith(['/films/123']);
  });
});
