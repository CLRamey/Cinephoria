import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from '../../projects/cinephoria-web/src/app/features/home/home.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { Router } from '@angular/router';
import { NEVER, of } from 'rxjs';

class SubFilmInfoService {
  getFilmInfo() {
    return of({
      FilmInfo: [
        {
          filmId: 1,
          filmTitle: 'Test Film Title',
          filmDescription: 'Test film description for testing purposes.',
          filmImg: 'TestFilmImage.webp',
          filmDuration: 148,
          filmFavorite: true,
          filmMinimumAge: 12,
          filmActiveDate: '2025-07-01',
          filmPublishingState: 'active',
          filmAverageRating: 4.7,
        },
      ],
    });
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: FilmInfoService, useClass: SubFilmInfoService },
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should show loading spinner when isLoading is true', async () => {
    const filmInfoService = TestBed.inject(FilmInfoService);
    jest.spyOn(filmInfoService, 'getFilmInfo').mockReturnValue(NEVER);
    component.isLoading = true;
    component.hasError = null;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const spinner = el.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should not show loading spinner when isLoading is false', async () => {
    component.isLoading = false;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const spinner = el.querySelector('mat-spinner');
    expect(spinner).toBeNull();
  });

  it('should navigate to the /films page when the button is clicked', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('button');
    button?.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/films']);
  });
  it('should navigate to film details on card click', () => {
    const film = {
      filmId: 1,
      filmTitle: 'Test Film Title',
      filmDescription: 'Test film description for testing purposes.',
      filmImg: 'TestFilmImage.webp',
      filmDuration: 148,
      filmFavorite: true,
      filmMinimumAge: 12,
      filmActiveDate: '2025-07-01',
      filmPublishingState: 'active',
      filmAverageRating: 4.7,
    };
    const router = TestBed.inject(Router);
    component.showFilmDetails(film);
    expect(router.navigate).toHaveBeenCalledWith([`/films/${film.filmId}`]);
  });
});
