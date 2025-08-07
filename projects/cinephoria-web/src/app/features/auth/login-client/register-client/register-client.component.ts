import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../auth/src/lib/services/auth.service';
import {
  nameValidator,
  noWhitespaceValidator,
  usernameValidator,
  passwordStrengthValidator,
  passwordMatchValidator,
} from '../../../../../../../auth/src/lib/validators/auth-validators';
import { Role } from '../../../../../../../auth/src/lib/interfaces/auth-interfaces';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CguCgvComponent } from '../../../../utils/dialogs/cgu-cgv/cgu-cgv.component';
import { PrivacyPolicyComponent } from '../../../../utils/dialogs/privacy-policy/privacy-policy.component';

@Component({
  selector: 'caw-register-client',
  templateUrl: './register-client.component.html',
  styleUrls: ['./register-client.component.scss'],
})
export class RegisterClientComponent {
  registerForm: FormGroup;
  showPassword = false;

  // Constructor that initializes the form and injects necessary services.
  // It also sets up the form with validators for each field.
  constructor(
    private fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            nameValidator(),
            noWhitespaceValidator,
          ],
        ],
        lastName: [
          '',
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
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
        agreedPolicy: [false, Validators.requiredTrue],
        agreedCgvCgu: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator('password') },
    );
  }

  // Method to open the privacy policy dialog.
  openPrivacyPolicy(): void {
    this.dialog.open(PrivacyPolicyComponent, {
      data: {},
    });
  }
  // Method to open the CGV/CGU dialog.
  openCguCgv(): void {
    this.dialog.open(CguCgvComponent, {
      data: {},
    });
  }

  // Method to handle registration submission.
  // It checks if the form is valid and then calls the authService to register the user.
  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.warn('Form is invalid:', this.registerForm.errors);
      return;
    }
    try {
      this.authService
        .register({
          userFirstName: this.registerForm.value.firstName.trim(),
          userLastName: this.registerForm.value.lastName.trim(),
          userUsername: this.registerForm.value.username.trim(),
          userEmail: this.registerForm.value.email.trim().toLowerCase(),
          userPassword: this.registerForm.value.password.trim(),
          userRole: Role.CLIENT,
          agreedPolicy: this.registerForm.value.agreedPolicy,
          agreedCgvCgu: this.registerForm.value.agreedCgvCgu,
        })
        .pipe(take(1))
        .subscribe({
          next: RegisterResponse => {
            if (!RegisterResponse.success) {
              this.snackBar.open(
                "Une erreur est survenue lors de l'inscription. Veuillez réessayer plus tard.",
                'Fermer',
                { duration: 5000, verticalPosition: 'top', panelClass: 'snackbar-error' },
              );
              return;
            } else {
              this.snackBar.open(
                'Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.',
                'Fermer',
                { duration: 5000, verticalPosition: 'top', panelClass: 'snackbar-success' },
              );
            }
            this.showPassword = false;
            this.registerForm.reset();
            Object.keys(this.registerForm.controls).forEach(key => {
              const control = this.registerForm.get(key);
              control?.setErrors(null);
              control?.markAsPristine();
              control?.markAsUntouched();
            });
          },
          error: error => {
            console.error('Registration failed:', error);
            this.snackBar.open(
              "Une erreur est survenue lors de l'inscription. Veuillez réessayer plus tard.",
              'Fermer',
              { duration: 5000, verticalPosition: 'top', panelClass: 'snackbar-error' },
            );
          },
        });
    } catch (error) {
      console.error('Unexpected error during registration:', error);
    }
  }
  // Method to toggle password visibility.
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
