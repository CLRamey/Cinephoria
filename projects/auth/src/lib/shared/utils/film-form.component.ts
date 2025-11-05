import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import {
  filmTitleValidator,
  filmDescriptionValidator,
  filmImgValidator,
  filmMinimumAgeValidator,
  filmDurationValidator,
  filmActiveDateValidator,
  positiveIntegerValidator,
} from '../../validators/staff-validators';
import { Films, GenreInfo } from '../../interfaces/staff-interfaces';
import { GenreInfoService } from '../../../../../cinephoria-web/src/app/services/genre-info.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'csh-film-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  template: `
    <h3 mat-dialog-title>{{ data?.filmTitle ? 'Modifier un film' : 'Ajouter un film' }}</h3>
    <form [formGroup]="filmForm" (ngSubmit)="onSubmit()" class="film-dialog-form">
      <mat-form-field appearance="outline">
        <mat-label>Titre du film</mat-label>
        <input matInput formControlName="filmTitle" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea matInput rows="3" formControlName="filmDescription"></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Image (URL)</mat-label>
        <input matInput formControlName="filmImg" />
        <mat-hint>https://example.com/img.webp</mat-hint>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Durée (minutes)</mat-label>
        <input matInput type="number" formControlName="filmDuration" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Âge minimum</mat-label>
        <input matInput type="number" formControlName="filmMinimumAge" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Date d'activation</mat-label>
        <input
          matInput
          [matDatepicker]="picker"
          formControlName="filmActiveDate"
          [matDatepickerFilter]="wednesdayFilter"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Genre principal</mat-label>
        <mat-select formControlName="genre1">
          <mat-option *ngFor="let g of genres" [value]="g.genreId">{{ g.genreType }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Deuxième genre (optionnel)</mat-label>
        <mat-select formControlName="genre2">
          <mat-option
            *ngFor="let g of genres"
            [value]="g.genreId"
            [disabled]="g.genreId === filmForm.get('genre1')?.value"
          >
            {{ g.genreType }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-checkbox formControlName="filmFavorite">Film favori</mat-checkbox>
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="filmForm.invalid">
          {{ data?.filmTitle ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .film-dialog-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        max-height: 80vh;
        width: 70vw;
        overflow-y: auto;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-shrink: 0;
      }
      mat-hint {
        font-size: 0.8rem;
        color: rgba(117, 109, 109, 1);
        font-style: italic;
      }
    `,
  ],
})
export class FilmFormComponent implements OnInit, OnDestroy {
  filmForm: FormGroup;
  data: Films | null;
  genres: GenreInfo[] | null = [];
  isModification: boolean;

  // Injecting necessary services and data
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<FilmFormComponent>,
    private readonly genreInfoService: GenreInfoService,
  ) {
    this.data = inject<Films | null>(MAT_DIALOG_DATA);
    this.isModification = !!this.data && !!this.data.filmId;
    this.filmForm = this.fb.group({
      filmTitle: [this.data?.filmTitle || '', [Validators.required, filmTitleValidator()]],
      filmDescription: [
        this.data?.filmDescription || '',
        [Validators.required, filmDescriptionValidator()],
      ],
      filmImg: [this.data?.filmImg || '', [Validators.required, filmImgValidator()]],
      filmDuration: [this.data?.filmDuration || 0, [Validators.required, filmDurationValidator()]],
      filmFavorite: [this.data?.filmFavorite || false],
      filmMinimumAge: [
        this.data?.filmMinimumAge || 0,
        [Validators.required, filmMinimumAgeValidator(), Validators.max(21)],
      ],
      filmActiveDate: [
        this.data?.filmActiveDate ? new Date(this.data.filmActiveDate) : null,
        this.isModification
          ? [Validators.required]
          : [Validators.required, filmActiveDateValidator()],
      ],
      genre1: [
        this.data?.genreFilms?.[0]?.genreId ?? null,
        [Validators.required, positiveIntegerValidator()],
      ],
      genre2: [this.data?.genreFilms?.[1]?.genreId ?? null, [positiveIntegerValidator()]],
    });
  }

  // Subscription to manage multiple observables
  private readonly subs = new Subscription();

  // Method to get filtered genres for the second genre selection
  ngOnInit(): void {
    const genreSub = this.genreInfoService.getGenreInfo().subscribe({
      next: (data: GenreInfo[] | null) => {
        const genresData = data ?? [];
        this.genres = genresData.sort((a, b) => a.genreType.localeCompare(b.genreType));
        if (this.data?.genreFilms?.length) {
          this.filmForm.patchValue({
            genre1: this.data.genreFilms[0]?.genreId ?? null,
            genre2: this.data.genreFilms[1]?.genreId ?? null,
          });
        }
      },
      error: err => console.error('Erreur lors du chargement des genres :', err),
    });
    this.subs.add(genreSub);
  }

  // Wednesday filter for datepicker
  readonly wednesdayFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day === 3;
  };

  // Method to handle form submission, first genre is mandatory, second is optional
  onSubmit(): void {
    if (this.filmForm.valid) {
      const { genre1, genre2, ...filmData } = this.filmForm.value;
      const genreIds = genre2 ? [genre1, genre2] : [genre1];
      this.dialogRef.close({ filmData: filmData, genreIds });
    }
  }

  // Method to handle cancellation
  onCancel(): void {
    this.dialogRef.close(null);
  }

  // Lifecycle hook to clean up subscriptions
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
