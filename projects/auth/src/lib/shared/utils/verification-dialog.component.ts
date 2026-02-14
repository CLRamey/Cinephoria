import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'csh-verification-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <h2 class="dialog-title">
        {{ data.title || 'Confirmation' }}
      </h2>
      <p class="dialog-message">{{ data.message }}</p>
      <div class="button-row">
        <button mat-stroked-button (click)="onCancel()">
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .confirm-dialog {
        padding: 1.5rem;
        text-align: center;
        max-width: 330px;
        border: 3px solid #80c683;
        border-radius: 3px;
      }
      .dialog-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 1.7rem;
      }
      .dialog-message {
        font-size: 15px;
        margin-bottom: 1.5rem;
      }
      .button-row {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
      }
    `,
  ],
})
export class VerificationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<VerificationDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
