import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmCardComponent } from '../../projects/cinephoria-web/src/app/utils/film-card/film-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
    filmAverageRating: 3.5,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FilmCardComponent);
    component = fixture.componentInstance;
    component.film = mockFilm;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display film title, description, age and duration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.film-title')?.textContent).toContain('Mock Film Title');
    expect(compiled.querySelector('.description')?.textContent).toContain(
      'Mock film description for testing purposes.',
    );
    expect(compiled.querySelector('.age')?.textContent).toContain('Âge minimum : 12 ans');
    expect(compiled.querySelector('.duration')?.textContent).toContain('Durée : 148 minutes');
  });

  it('should display the favorite badge if film is marked as favorite', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.favorite-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Coup de cœur');
  });

  it('should display average rating with correct number of stars', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const allIcons = compiled.querySelectorAll('mat-icon');
    const starIcons = Array.from(allIcons).filter(icon =>
      ['star', 'star_half', 'star_border'].includes(icon.textContent?.trim() || ''),
    );
    expect(starIcons.length).toBe(5);
    expect(starIcons[0].textContent?.trim()).toBe('star');
    expect(starIcons[1].textContent?.trim()).toBe('star');
    expect(starIcons[2].textContent?.trim()).toBe('star');
    expect(starIcons[3].textContent?.trim()).toBe('star_half');
    expect(starIcons[4].textContent?.trim()).toBe('star_border');
  });

  it('should render film image correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain(mockFilm.filmImg);
    expect(img.alt).toContain(mockFilm.filmTitle);
  });
});
