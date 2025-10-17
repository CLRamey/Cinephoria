import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { positiveIntegerValidator, isIntegerValidator } from '../../validators/staff-validators';
import { Rooms, Cinema, QualityInfo } from '../../interfaces/staff-interfaces';
import { QualityInfoService } from '../../../../../cinephoria-web/src/app/services/quality-info.service';

@Component({
  selector: 'csh-room-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h3 mat-dialog-title>{{ data?.roomId ? 'Modifier une salle' : 'Créer une salle' }}</h3>
    <form [formGroup]="roomForm" (ngSubmit)="onSubmit()" class="room-dialog-form">
      <div class="cinema-header" *ngIf="cinemaName">
        <p>
          Cinéma :
          <strong>{{ cinemaName }}</strong>
          <br />
          <span class="subtitle">
            Veuillez compléter les champs ci-dessous pour créer une nouvelle salle.
          </span>
        </p>
      </div>
      <div class="cinema-header" *ngIf="cinemaSelected">
        <p>
          Cinéma :
          <strong>{{ cinemaSelected }}</strong>
          <br />
          <span class="subtitle">
            Veuillez compléter les champs ci-dessous pour modifier la salle existante.
          </span>
        </p>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Numéro de salle</mat-label>
        <input matInput type="number" formControlName="roomNumber" />
      </mat-form-field>
      <div class="capacity-info" *ngIf="totalCapacity > 0">
        <strong>Nouvelle capacité totale :</strong>
        <span>{{ totalCapacity }} sièges</span>
      </div>
      <div class="capacity-info" *ngIf="roomCapacity > 0">
        <strong>Capacité totale :</strong>
        <span>{{ roomCapacity }} sièges</span>
        <p class="capacity-exp">
          Vous pouvez saisir un nouveau nombre de rangées et de sièges par rangée uniquement si vous
          souhaitez modifier la capacité de cette salle.
        </p>
      </div>
      <div class="capacity-info" *ngIf="!roomCapacity && totalCapacity === 0">
        <strong>Capacité de la salle :</strong>
        <p class="capacity-ind">
          Veuillez spécifier le nombre de rangées et le nombre de sièges par rangée (une capacité
          minimale de 20 sièges est requise pour créer une salle avec succès.)
        </p>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Nombre de rangées</mat-label>
        <input matInput type="number" formControlName="numRows" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Sièges par rangée</mat-label>
        <input matInput type="number" formControlName="seatsPerRow" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Qualité de la salle</mat-label>
        <mat-select formControlName="qualityId">
          <mat-option *ngFor="let q of qualities" [value]="q.qualityId">
            {{ q.qualityProjectionType }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="roomForm.invalid">
          {{ data?.roomId ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .room-dialog-form {
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
      .cinema-header {
        font-size: 0.9rem;
        margin-left: 0.25rem;
        .span {
          font-style: italic;
        }
      }
      strong {
        font-weight: 500;
      }
      .subtitle {
        font-size: 0.8rem;
        font-style: italic;
      }
      .capacity-info {
        font-size: 0.9rem;
        margin-left: 0.25rem;
      }
      .capacity-exp {
        font-size: 0.8rem;
        font-style: italic;
        color: #f49100;
      }
      .capacity-ind {
        font-size: 0.8rem;
        font-style: italic;
      }
    `,
  ],
})
export class RoomFormComponent implements OnInit, OnDestroy {
  roomForm: FormGroup;
  data: Rooms | null;
  cinemas: Cinema[] = [];
  qualities: QualityInfo[] = [];
  totalCapacity: number = 0;
  roomCapacity: number = 0;
  cinemaName: string = '';
  cinemaSelected: string = '';

  // Injecting necessary services and data
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RoomFormComponent>,
    private readonly qualityInfoService: QualityInfoService,
  ) {
    this.data = inject<Rooms | null>(MAT_DIALOG_DATA);
    this.cinemaName = this.data?.cinemaName ?? '';
    this.cinemaSelected = this.data?.cinema?.cinemaName ?? '';
    this.roomForm = this.fb.group({
      roomNumber: [this.data?.roomNumber ?? 0, [Validators.required, positiveIntegerValidator()]],
      numRows: [this.data?.numRows ?? 0, [Validators.required, isIntegerValidator()]],
      seatsPerRow: [this.data?.seatsPerRow ?? 0, [Validators.required, isIntegerValidator()]],
      qualityId: [this.data?.qualityId ?? 0, [Validators.required, positiveIntegerValidator()]],
      cinemaId: [this.data?.cinemaId ?? 0, [Validators.required, positiveIntegerValidator()]],
    });
    if (this.data?.roomId) {
      this.roomForm.get('roomNumber')?.disable();
    }
  }

  // Subscription to manage multiple observables
  private readonly subs = new Subscription();

  // Lifecycle hook to initialize the component and load necessary data
  ngOnInit(): void {
    const qualitySub = this.qualityInfoService.getQualityInfo().subscribe({
      next: (data: QualityInfo[] | null) => {
        this.qualities = data ?? [];
        if (this.data?.qualityId) {
          this.roomForm.patchValue({ qualityId: this.data.qualityId });
        }
        if (this.data?.roomId) {
          this.roomCapacity = this.data.roomCapacity || 0;
        }
      },
      error: err => console.error('Erreur lors du chargement des qualités :', err),
    });
    this.subs.add(qualitySub);
    const capacitySub = this.roomForm.valueChanges.subscribe(() => {
      const totalCapacity = this.calculateTotalCapacity();
      this.totalCapacity = totalCapacity;
    });
    this.subs.add(capacitySub);
  }

  // Method to calculate the total capacity of the room
  calculateTotalCapacity(): number {
    const numRows = this.roomForm.get('numRows')?.value || 0;
    const seatsPerRow = this.roomForm.get('seatsPerRow')?.value || 0;
    const totalCapacity = numRows * seatsPerRow;
    return totalCapacity;
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.roomForm.valid) {
      const { numRows, seatsPerRow, ...roomData } = this.roomForm.value;
      this.dialogRef.close({ roomData, numRows: numRows, seatsPerRow: seatsPerRow });
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
