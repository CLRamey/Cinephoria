import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmsComponent } from '../../projects/cinephoria-web/src/app/features/films/films.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { GenreInfoService } from '../../projects/cinephoria-web/src/app/services/genre-info.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Stub services with minimal real logic
class SubFilmInfoService {
  getFilmInfo() {
    return of({
      FilmInfo: [
        {
          filmId: 1,
          filmTitle: 'Test Film Title',
          cinemaFilms: [],
          genreFilms: [],
          screenings: [],
        },
      ],
    });
  }
}
class SubCinemaInfoService {
  getCinemaInfo() {
    return of({
      CinemaInfo: [
        { cinemaId: 2, cinemaName: 'Cinema2' },
        { cinemaId: 1, cinemaName: 'Cinema1' },
      ],
    });
  }
}
class SubGenreInfoService {
  getGenreInfo() {
    return of([
      { genreId: 2, genreType: 'Comedy' },
      { genreId: 1, genreType: 'Adventure' },
    ]);
  }
}

describe('FilmsComponent (Integration)', () => {
  let fixture: ComponentFixture<FilmsComponent>;
  let component: FilmsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilmsComponent],
      providers: [
        { provide: FilmInfoService, useClass: SubFilmInfoService },
        { provide: CinemaInfoService, useClass: SubCinemaInfoService },
        { provide: GenreInfoService, useClass: SubGenreInfoService },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmsComponent);
    component = fixture.componentInstance;
  });

  it('should sort and map cinemas correctly', () => {
    component['loadFilters']();
    expect(component.cinemas).toEqual([
      { id: 1, name: 'Cinema1' },
      { id: 2, name: 'Cinema2' },
    ]);
  });

  it('should sort and map genres correctly', () => {
    component['loadFilters']();
    expect(component.genres).toEqual([
      { id: 1, name: 'Adventure' },
      { id: 2, name: 'Comedy' },
    ]);
  });

  it('should load films and set loading state', () => {
    expect(component.isLoading).toBe(false);
    component['loadFilms']();
    expect(component.films.length).toBe(1);
    expect(component.filteredFilms.length).toBe(1);
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBeNull();
    expect(component.films[0].filmTitle).toBe('Test Film Title');
  });
});
