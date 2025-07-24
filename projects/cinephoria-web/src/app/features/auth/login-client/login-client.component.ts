import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../../../../../auth/src/lib/services/auth.service';
import { passwordMatchValidator } from '../../../../../../auth/src/lib/validators/auth-validators';

import { Router } from '@angular/router';

@Component({
  selector: 'caw-login-client',
  templateUrl: './login-client.component.html',
  styleUrl: './login-client.component.scss',
})
export class LoginClientComponent {
  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: this.fb.control<string | null>('', [Validators.required, Validators.email]),
      password: this.fb.control<string | null>('', [
        Validators.required,
        passwordMatchValidator('password'),
      ]),
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ userEmail: email!, userPassword: password! });
      Object.keys(this.loginForm.controls).forEach(control => {
        const formControl = this.loginForm.get(control);
        if (formControl && formControl.invalid) {
          console.log(`Control ${control} is invalid:`, formControl.errors);
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/login-client/register']);
  }
}
