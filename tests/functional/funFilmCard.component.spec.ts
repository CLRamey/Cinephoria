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
    filmAverageRating: 4.5,
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

  it('should emit filmClicked event on card click', () => {
    jest.spyOn(component.filmClicked, 'emit');
    const card = fixture.nativeElement.querySelector('mat-card');
    card.click();
    expect(component.filmClicked.emit).toHaveBeenCalledWith(mockFilm);
  });
});
