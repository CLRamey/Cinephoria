import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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

describe('FilmFormComponent', () => {
  let component: FilmFormComponent;
  let fixture: ComponentFixture<FilmFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmFormComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
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

  it('should call ngOnInit and initialize genres from GenreInfoService', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockGenreInfoService.getGenreInfo).toHaveBeenCalled();
    expect(component.genres?.length).toBe(2);
    expect(component.genres?.[0].genreType).toBe('Action');
  });

  it('should filter the wednesday dates correctly', () => {
    const wednesday = new Date('2024-06-05');
    const notWednesday = new Date('2024-06-06');
    expect(component.wednesdayFilter(wednesday)).toBe(true);
    expect(component.wednesdayFilter(notWednesday)).toBe(false);
  });

  it('should close dialog with film data when form is valid and submitted', () => {
    component.filmForm.setValue({
      filmTitle: 'Avatar',
      filmDescription: 'Epic sci-fi film',
      filmImg: 'https://example.com/img.webp',
      filmDuration: 120,
      filmFavorite: true,
      filmMinimumAge: 12,
      filmActiveDate: '2025-12-10',
      genre1: 1,
      genre2: null,
    });
    expect(component.filmForm.valid).toBe(true);
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      filmData: expect.objectContaining({
        filmTitle: 'Avatar',
        filmDescription: 'Epic sci-fi film',
        filmFavorite: true,
      }),
      genreIds: [1],
    });
  });

  it('should close dialog with null when cancelled', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subs'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
