import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmCardComponent } from '../../projects/cinephoria-web/src/app/utils/film-card/film-card.component';

describe('FilmCardComponent', () => {
  let component: FilmCardComponent;
  let fixture: ComponentFixture<FilmCardComponent>;

  const mockFilm = {
    filmId: 1,
    filmTitle: 'Mock Film Title',
    filmDescription: 'Mock film description for testing purposes.',
    filmImg: 'MockFilmImage.webp',
    filmDuration: 148,
    filmFavorite: true,
    filmMinimumAge: 12,
    filmActiveDate: '2025-06-16',
    filmPublishingState: 'active',
    filmAverageRating: 4.7,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilmCardComponent);
    component = fixture.componentInstance;
    component.film = mockFilm;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct star icons for average rating', () => {
    const icons = component.getStarIcons(mockFilm);
    expect(icons).toEqual(['star', 'star', 'star', 'star', 'star_half']);
  });

  it('should emit filmClicked event when onFilmClick is called', () => {
    jest.spyOn(component.filmClicked, 'emit');
    component.onFilmClick();
    expect(component.filmClicked.emit).toHaveBeenCalledWith(mockFilm);
  });
});
