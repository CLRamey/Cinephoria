import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { Screenings } from '../../interfaces/staff-interfaces';

@Component({
  selector: 'csh-screening-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h3 mat-dialog-title>{{ data?.screeningId ? 'Modifier une séance' : 'Créer une séance' }}</h3>
    <form [formGroup]="screeningForm" (ngSubmit)="onSubmit()" class="screening-dialog-form">
      <div class="cinema-info">
        <p>
          <strong>Cinéma :</strong>
          {{ cinemaSelected }}
        </p>
        <p>
          <strong>Salle :</strong>
          {{ roomSelected }}
        </p>
        <p>
          <strong>Film :</strong>
          {{ filmSelected }}
        </p>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input
          matInput
          [matDatepicker]="picker"
          [matDatepickerFilter]="pastDateFilter"
          formControlName="date"
          required
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Heure</mat-label>
        <input matInput type="time" formControlName="time" required />
      </mat-form-field>
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="screeningForm.invalid">
          {{ data?.screeningId ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .screening-dialog-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        max-height: 80vh;
        width: 60vw;
        overflow-y: auto;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-shrink: 0;
      }
      .cinema-info p {
        font-size: 0.9rem;
        margin: 0.25rem 0;
      }
    `,
  ],
})
export class ScreeningFormComponent implements OnInit, OnDestroy {
  screeningForm: FormGroup;
  data: Screenings | null;
  // These will be set by the parent component when opening the dialog
  cinemaSelected: string = '';
  roomSelected: number = 0;
  filmSelected: string = '';

  // Injecting necessary services and data
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ScreeningFormComponent>,
  ) {
    this.data = inject<Screenings | null>(MAT_DIALOG_DATA);
    this.cinemaSelected = this.data?.cinema?.cinemaName ?? '';
    this.roomSelected = this.data?.room?.roomNumber ?? 0;
    this.filmSelected = this.data?.film?.filmTitle ?? '';
    this.screeningForm = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
    });
  }
  // Subscription to manage multiple observables
  private readonly subs = new Subscription();

  // Lifecycle hook to initialize the component and load necessary data
  ngOnInit(): void {
    // If editing existing screening, prefill date/time
    if (this.data?.screeningDate) {
      const date = new Date(this.data.screeningDate);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const localTime = `${hours}:${minutes}`;
      this.screeningForm.patchValue({ date: date, time: localTime });
    }
  }

  // Method to block past dates for datepicker
  readonly pastDateFilter = (date: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    return (date || new Date()) >= today;
  };

  // Method to handle form submission
  onSubmit(): void {
    if (this.screeningForm.valid) {
      const { date, time } = this.screeningForm.value;
      // Combine date + time into single datetime
      const [hours, minutes] = time.split(':').map((x: string) => parseInt(x, 10));
      const screeningDate = new Date(date);
      screeningDate.setHours(hours, minutes, 0, 0);
      const formattedDate = `${screeningDate.getFullYear()}-${String(screeningDate.getMonth() + 1).padStart(2, '0')}-${String(screeningDate.getDate()).padStart(2, '0')} ${String(screeningDate.getHours()).padStart(2, '0')}:${String(screeningDate.getMinutes()).padStart(2, '0')}:00`;
      const cinemaId = this.data?.cinema?.cinemaId || this.data?.cinemaId;
      const roomId = this.data?.room?.roomId || this.data?.roomId;
      const filmId = this.data?.film?.filmId || this.data?.filmId;
      console.log('Submitting screening form:', { cinemaId, roomId, filmId, formattedDate });
      const screeningData = {
        cinemaId: cinemaId,
        roomId: roomId,
        filmId: filmId,
        screeningDate: formattedDate,
      };
      this.dialogRef.close({ screeningData });
    }
  }

  // Method to handle form cancellation
  onCancel(): void {
    this.dialogRef.close(null);
  }

  // Lifecycle hook to clean up subscriptions
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
