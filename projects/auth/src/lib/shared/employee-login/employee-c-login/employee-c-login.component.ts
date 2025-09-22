import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { passwordStrengthValidator } from '../../../validators/auth-validators';

import { Router } from '@angular/router';
import { take, filter, timeout } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  loginSuccessSnackBar,
  catchErrorSnackBar,
  resetForm,
  errorForm,
} from '../../utils/shared-responses';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Role } from '../../../interfaces/auth-interfaces';

@Component({
  selector: 'csh-employee-c-login',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './employee-c-login.component.html',
  styleUrl: './employee-c-login.component.scss',
})
export class EmployeeCLoginComponent {
  showPassword = false;
  loginError = false;
  loginForm: FormGroup;

  // Constructor that initializes the form and injects necessary services.
  // It also sets up the form with validators for each field.
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
    });
  }

  // Method to handle login submission.
  // It checks if the form is valid, authentication and role authorization prior to navigating to the secured employee space.
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loginError = false;
    const credentials = {
      userEmail: this.loginForm.value.email.trim().toLowerCase(),
      userPassword: this.loginForm.value.password.trim(),
    };
    try {
      this.authService
        .loginCookieEmployee(credentials)
        .pipe(take(1))
        .subscribe({
          next: async () => {
            const isAuth = await firstValueFrom(
              this.authService.isAuthenticated$.pipe(
                filter(isAuth => isAuth === true),
                timeout(3000),
                take(1),
              ),
            );
            const role = await firstValueFrom(
              this.authService.userRole$.pipe(
                filter(role => role === Role.EMPLOYEE),
                timeout(3000),
                take(1),
              ),
            );
            if (!isAuth || role !== Role.EMPLOYEE) {
              this.loginError = true;
              errorForm(this.loginForm);
              return;
            }
            this.loginError = false;
            resetForm(this.loginForm);
            loginSuccessSnackBar(this.snackBar);
            // Navigate to dashboard with full refreshed state
            this.router.navigate(['/employee']);
          },
          error: err => {
            console.error('Login failed:', err);
            this.loginError = true;
            errorForm(this.loginForm);
          },
        });
    } catch (err) {
      console.error('Unexpected login failure:', err);
      this.loginError = true;
      catchErrorSnackBar(this.snackBar);
      resetForm(this.loginForm);
      this.authService.logout();
      this.router.navigate(['/accueil']);
      return;
    }
  }

  // Method to toggle password visibility.
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
