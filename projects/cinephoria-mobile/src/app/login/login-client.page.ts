import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonText,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../../auth/src/lib/services/auth.service';
import { passwordStrengthValidator } from '../../../../auth/src/lib/validators/auth-validators';
import { firstValueFrom } from 'rxjs';
import { take, filter, timeout } from 'rxjs/operators';
import { Role } from '../../../../auth/src/lib/interfaces/auth-interfaces';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './login-client.page.html',
  styleUrls: ['./login-client.page.scss'],
  imports: [
    IonLabel,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonHeader,
    IonToolbar,
    IonContent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
  ],
})
export class LoginClientPageComponent {
  showPassword = false;
  loginError = false;
  loginForm: FormGroup;

  // Constructor that initializes the form and injects necessary services.
  // It also sets up the form with validators for each field.
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
    });
  }

  // Method to handle login submission.
  // It checks if the form is valid, authentication and role authorization prior to navigating to the secured client space.
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
        .loginCookieClient(credentials)
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
                filter(role => role === Role.CLIENT),
                timeout(3000),
                take(1),
              ),
            );
            if (!isAuth || role !== Role.CLIENT) {
              this.loginError = true;
              this.loginForm.patchValue({ password: '' });
              Object.keys(this.loginForm.controls).forEach(key => {
                const control = this.loginForm.get(key);
                control?.setErrors({ incorrect: true });
                control?.markAsTouched();
                control?.markAsDirty();
              });
              return;
            }
            this.loginError = false;
            this.loginForm.reset();
            Object.keys(this.loginForm.controls).forEach(key => {
              const control = this.loginForm.get(key);
              control?.setErrors(null);
              control?.markAsPristine();
              control?.markAsUntouched();
            });
            this.router.navigate(['/client']);
          },
          error: err => {
            console.error('Login failed:', err);
            this.loginError = true;
            this.loginForm.patchValue({ password: '' });
            Object.keys(this.loginForm.controls).forEach(key => {
              const control = this.loginForm.get(key);
              control?.setErrors({ incorrect: true });
              control?.markAsTouched();
              control?.markAsDirty();
            });
          },
        });
    } catch (err) {
      console.error('Unexpected login failure:', err);
      this.loginError = true;
      this.loginForm.reset();
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.setErrors(null);
        control?.markAsPristine();
        control?.markAsUntouched();
      });
      this.authService.logoutSecurely();
      this.router.navigate(['/accueil']);
      return;
    }
  }

  // Method to toggle password visibility.
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
