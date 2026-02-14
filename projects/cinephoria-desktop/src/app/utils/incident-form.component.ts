import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IncidentForm } from '../../../../auth/src/lib/interfaces/employee-interfaces';
import { Subscription } from 'rxjs';
import {
  incidentEquipmentValidator,
  incidentDescriptionValidator,
} from '../../../../auth/src/lib/validators/employee-validators';

@Component({
  selector: 'cad-incident-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  template: `
    <h3 mat-dialog-title>{{ data?.incidentId ? 'Modifier un incident' : 'Créer un incident' }}</h3>
    <form [formGroup]="incidentForm" (ngSubmit)="onSubmit()" class="incident-dialog-form">
      <div class="incident-info">
        <p>
          <strong>Cinéma :</strong>
          {{ cinemaSelected }}
        </p>
        <p>
          <strong>Salle :</strong>
          {{ roomSelected }}
        </p>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Équipement</mat-label>
        <textarea matInput rows="1" formControlName="incidentEquipment"></textarea>
        <mat-hint>Exemple : Projecteur, Système audio, Siège défectueux</mat-hint>
        <mat-error *ngIf="incidentForm.get('incidentEquipment')?.hasError('required')">
          Veuillez renseigner l'équipement, cette information est obligatoire.
        </mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea matInput rows="3" formControlName="incidentDescription"></textarea>
        <mat-hint>
          Décrivez le problème en détail afin que l'équipe puisse comprendre et résoudre
          efficacement (limite de 255 caractères).
        </mat-hint>
        <mat-error *ngIf="incidentForm.get('incidentDescription')?.hasError('required')">
          Veuillez renseigner la description, cette information est obligatoire.
        </mat-error>
      </mat-form-field>
      <mat-checkbox formControlName="incidentStatus">Incident résolu</mat-checkbox>
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="incidentForm.invalid">
          {{ data?.incidentId ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .incident-dialog-form {
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
      .incident-info p {
        font-size: 0.9rem;
        margin: 0.25rem 0;
      }
      mat-hint {
        font-size: 0.8rem;
        color: rgba(117, 109, 109, 1);
        font-style: italic;
      }
    `,
  ],
})
export class IncidentFormComponent implements OnInit, OnDestroy {
  incidentForm: FormGroup;
  data: IncidentForm | null = null;
  // These will be set by the parent component when opening the dialog
  cinemaSelected: string = '';
  roomSelected: number = 0;

  // Injecting necessary services and data
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<IncidentFormComponent>,
  ) {
    this.data = inject<IncidentForm | null>(MAT_DIALOG_DATA);
    this.cinemaSelected = this.data?.cinema?.cinemaName ?? '';
    this.roomSelected = this.data?.room?.roomNumber ?? 0;
    const isResolved = this.data?.incidentStatus === 'resolved';
    this.incidentForm = this.fb.group({
      incidentEquipment: [null, [Validators.required, incidentEquipmentValidator()]],
      incidentDescription: [null, [Validators.required, incidentDescriptionValidator()]],
      incidentStatus: [isResolved],
    });
  }
  // Subscription to manage multiple observables
  private readonly subs = new Subscription();

  // Lifecycle hook to initialize the component and load necessary data
  ngOnInit(): void {
    // If editing existing incident, prefill data
    if (this.data?.incidentEquipment) {
      this.incidentForm.patchValue({
        incidentEquipment: this.data.incidentEquipment,
        incidentDescription: this.data.incidentDescription,
      });
    } else {
      this.incidentForm.patchValue({
        incidentEquipment: '',
        incidentDescription: '',
        incidentStatus: false,
      });
    }
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.incidentForm.invalid) {
      return;
    }
    const incidentData = {
      incidentEquipment: this.incidentForm.value.incidentEquipment,
      incidentDescription: this.incidentForm.value.incidentDescription,
      incidentStatus: this.incidentForm.value.incidentStatus ? 'resolved' : 'open',
    };
    this.dialogRef.close({ incidentData });
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
