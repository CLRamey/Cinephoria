import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../../../auth/src/lib/services/auth.service';
import { passwordStrengthValidator } from '../../../../../../auth/src/lib/validators/auth-validators';

import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { take, filter, timeout } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  loginSuccessSnackBar,
  catchErrorSnackBar,
  resetForm,
  errorForm,
} from '../../../../../../auth/src/lib/shared/utils/shared-responses';
import { Role } from '../../../../../../auth/src/lib/interfaces/auth-interfaces';

@Component({
  selector: 'caw-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss'],
})
export class LoginAdminComponent {
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
  // It checks if the form is valid, authentication and role authorization prior to navigating to the secured admin space.
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
        .loginCookieAdmin(credentials)
        .pipe(take(1))
        .subscribe({
          next: async () => {
            try {
              const isAuth = await firstValueFrom(
                this.authService.isAuthenticated$.pipe(
                  filter(isAuth => isAuth === true),
                  timeout(3000),
                  take(1),
                ),
              );
              const role = await firstValueFrom(
                this.authService.userRole$.pipe(
                  filter(role => role === Role.ADMIN),
                  timeout(3000),
                  take(1),
                ),
              );
              if (!isAuth || role !== Role.ADMIN) {
                this.loginError = true;
                errorForm(this.loginForm);
                return;
              }
              this.loginError = false;
              resetForm(this.loginForm);
              loginSuccessSnackBar(this.snackBar);
              // Navigate to dashboard with full refreshed state
              this.router.navigate(['/admin']);
            } catch (err) {
              console.error('Role or authentication check failed:', err);
              this.loginError = true;
              errorForm(this.loginForm);
            }
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
