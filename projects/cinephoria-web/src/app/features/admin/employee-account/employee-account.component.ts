import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  Employees,
  EmployeeResetPassword,
  CreateEmployee,
  EmployeeRole,
} from '../../../interfaces/staff-interfaces';
import { Subscription } from 'rxjs';
import {
  nameValidator,
  noWhitespaceValidator,
  usernameValidator,
  passwordStrengthValidator,
  passwordMatchValidator,
} from '../../../../../../auth/src/lib/validators/auth-validators';

@Component({
  selector: 'caw-employee-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h3 mat-dialog-title>
      {{ data?.userId ? "Modifier le mot de passe d'un employé" : 'Créer un compte employé' }}
    </h3>
    <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form">
      <ng-container *ngIf="!data?.userId">
        <mat-form-field appearance="outline">
          <mat-label>Prénom</mat-label>
          <input
            matInput
            formControlName="firstName"
            [attr.aria-label]="'Prénom'"
            [attr.aria-required]="true"
            required
          />
        </mat-form-field>
        <mat-error *ngIf="employeeForm.get('firstName')?.hasError('required')">
          Veuillez entrer votre prénom.
        </mat-error>
        <mat-error *ngIf="employeeForm.get('firstName')?.hasError('invalidName')">
          Format de prénom invalide.
        </mat-error>
        <mat-form-field appearance="outline">
          <mat-label>Nom</mat-label>
          <input
            matInput
            formControlName="lastName"
            [attr.aria-label]="'Nom'"
            [attr.aria-required]="true"
            required
          />
          <mat-error *ngIf="employeeForm.get('lastName')?.hasError('required')">
            Veuillez entrer votre nom.
          </mat-error>
          <mat-error *ngIf="employeeForm.get('lastName')?.hasError('invalidName')">
            Format de nom invalide.
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nom d'utilisateur</mat-label>
          <input
            matInput
            formControlName="username"
            aria-label="Nom d'utilisateur"
            [attr.aria-required]="true"
            required
          />
          <mat-error *ngIf="employeeForm.get('username')?.hasError('required')">
            Veuillez entrer un nom d'utilisateur.
          </mat-error>
          <mat-error *ngIf="employeeForm.get('username')?.hasError('invalidUsername')">
            Caractères alphanumériques uniquement.
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Adresse e-mail</mat-label>
          <input
            matInput
            formControlName="email"
            autocomplete="email"
            [attr.aria-label]="'Adresse e-mail'"
            [attr.aria-required]="true"
            required
            spellcheck="false"
            type="email"
          />
          <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
            Veuillez entrer une adresse e-mail.
          </mat-error>
          <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
            Format d'adresse e-mail invalide.
          </mat-error>
        </mat-form-field>
      </ng-container>
      <ng-container *ngIf="data?.userId">
        <div class="employee-info">
          <p>
            <strong>Nom:</strong>
            {{ data?.userLastName }}
          </p>
          <p>
            <strong>Prénom:</strong>
            {{ data?.userFirstName }}
          </p>
          <p>
            <strong>Nom d'utilisateur:</strong>
            {{ data?.userUsername }}
          </p>
          <p>
            <strong>Adresse e-mail:</strong>
            {{ data?.userEmail }}
          </p>
        </div>
      </ng-container>
      <mat-form-field appearance="outline">
        <mat-label>Mot de passe</mat-label>
        <input
          matInput
          [type]="showPassword ? 'text' : 'password'"
          formControlName="password"
          autocomplete="new-password"
          spellcheck="false"
          [attr.aria-label]="'Mot de passe'"
          [attr.aria-required]="true"
          type="password"
        />
        <button
          mat-icon-button
          matSuffix
          (click)="togglePasswordVisibility()"
          type="button"
          [attr.aria-label]="'Afficher/Masquer mot de passe'"
        >
          <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="employeeForm.get('password')?.hasError('required')">
          Veuillez entrer un mot de passe.
        </mat-error>
        <mat-error *ngIf="employeeForm.get('password')?.hasError('passwordStrength')">
          ≥12 (majuscule, minuscule, chiffre, spécial).
        </mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Confirmer le mot de passe</mat-label>
        <input
          matInput
          [type]="showPassword ? 'text' : 'password'"
          formControlName="confirmPassword"
          autocomplete="new-password"
          spellcheck="false"
          [attr.aria-label]="'Confirmer le mot de passe'"
          [attr.aria-required]="true"
          required
        />
        <button
          mat-icon-button
          matSuffix
          (click)="togglePasswordVisibility()"
          type="button"
          [attr.aria-label]="'Afficher/Masquer mot de passe'"
        >
          <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="employeeForm.get('confirmPassword')?.hasError('required')">
          Veuillez confirmer votre mot de passe.
        </mat-error>
        <mat-error *ngIf="employeeForm.get('confirmPassword')?.hasError('passwordMismatch')">
          Les mots de passe ne correspondent pas.
        </mat-error>
      </mat-form-field>
      <div class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="employeeForm.invalid">
          {{ data?.userId ? 'Mettre à jour le compte' : 'Créer le compte' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .employee-form {
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
      .employee-info p {
        font-size: 0.9rem;
        margin: 0.25rem 0;
      }
    `,
  ],
})
export class EmployeeAccountComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  data: Employees | null;
  showPassword = false;
  // These will be set by the parent component when opening the dialog
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';

  // Injecting necessary services and data
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<EmployeeAccountComponent>,
  ) {
    this.data = inject<Employees | null>(MAT_DIALOG_DATA);
    this.employeeForm = this.fb.group(
      {
        firstName: [
          this.data?.userFirstName ?? '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            nameValidator(),
            noWhitespaceValidator,
          ],
        ],
        lastName: [
          this.data?.userLastName ?? '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            nameValidator(),
            noWhitespaceValidator,
          ],
        ],
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
            usernameValidator(),
            noWhitespaceValidator,
          ],
        ],
        email: [this.data?.userEmail ?? '', [Validators.required, Validators.email]],
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator('password') },
    );
    if (this.data?.userId) {
      this.employeeForm.get('firstName')?.disable();
      this.employeeForm.get('lastName')?.disable();
      this.employeeForm.get('username')?.disable();
      this.employeeForm.get('email')?.disable();
    }
  }
  // Subscription to manage multiple observables
  private readonly subs = new Subscription();

  // Lifecycle hook to initialize the component and load necessary data
  ngOnInit(): void {
    if (this.data) {
      this.firstName = this.data?.userFirstName;
      this.lastName = this.data?.userLastName;
      this.username = this.data?.userUsername;
      this.email = this.data?.userEmail;
    }
  }

  // Method to toggle password visibility.
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.employeeForm.valid && !this.data?.userId) {
      const formValues = this.employeeForm.value;
      const employeeData: CreateEmployee = {
        userFirstName: formValues.firstName.trim(),
        userLastName: formValues.lastName.trim(),
        userUsername: formValues.username.trim(),
        userEmail: formValues.email.trim().toLowerCase(),
        userPassword: formValues.password.trim(),
        userRole: EmployeeRole.EMPLOYEE,
      };
      this.dialogRef.close({ employeeData });
    } else if (this.data?.userId) {
      const resetData: EmployeeResetPassword = {
        userId: this.data.userId,
        newPassword: this.employeeForm.value.password.trim(),
      };
      this.dialogRef.close({ resetData });
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
