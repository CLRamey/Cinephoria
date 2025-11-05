import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FilmFormComponent } from '../../projects/auth/src/lib/shared/utils/film-form.component';
import { GenreInfoService } from '../../projects/cinephoria-web/src/app/services/genre-info.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';
import { GenreInfo } from '../../projects/auth/src/lib/interfaces/staff-interfaces';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const mockDialogRef = {
  close: jest.fn(),
};

const mockGenreInfoService = {
  getGenreInfo: jest.fn().mockReturnValue(
    of<GenreInfo[]>([
      { genreId: 1, genreType: 'Action' },
      { genreId: 2, genreType: 'Comedy' },
    ]),
  ),
};

const mockData = {
  filmId: 1,
  filmTitle: 'Inception',
  filmDescription: 'A mind-bending thriller',
  filmImg: 'https://example.com/inception.jpg',
  filmDuration: 148,
  filmFavorite: true,
  filmMinimumAge: 13,
  filmActiveDate: '2025-12-10',
  genreFilms: [
    { genreId: 1, genreType: 'Action' },
    { genreId: 2, genreType: 'Comedy' },
  ],
};

describe('Integration FilmFormComponent', () => {
  let component: FilmFormComponent;
  let fixture: ComponentFixture<FilmFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmFormComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: GenreInfoService, useValue: mockGenreInfoService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have form values initialized from injected data (constructor/patch)', () => {
    expect(component.filmForm.get('filmTitle')?.value).toBe('Inception');
    expect(component.filmForm.get('filmDescription')?.value).toBe('A mind-bending thriller');
    expect(component.filmForm.get('filmImg')?.value).toBe('https://example.com/inception.jpg');
    expect(component.filmForm.get('filmDuration')?.value).toBe(148);
    expect(component.filmForm.get('filmFavorite')?.value).toBe(true);
    expect(component.filmForm.get('filmMinimumAge')?.value).toBe(13);
    const activeDate = component.filmForm.get('filmActiveDate')?.value;
    expect(activeDate).toEqual(new Date('2025-12-10'));
    expect(component.filmForm.get('genre1')?.value).toBe(1);
    expect(component.filmForm.get('genre2')?.value).toBe(2);
  });

  it('ngOnInit should call GenreInfoService and sort genres', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockGenreInfoService.getGenreInfo).toHaveBeenCalled();
    expect(component.genres?.map(g => g.genreType)).toEqual(['Action', 'Comedy']);
  });

  it('should handle GenreInfoService error without throwing and log the error', () => {
    mockGenreInfoService.getGenreInfo.mockReturnValueOnce(
      throwError(() => new Error('Service error')),
    );
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockGenreInfoService.getGenreInfo).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors du chargement des genres :',
      expect.any(Error),
    );
  });
});
