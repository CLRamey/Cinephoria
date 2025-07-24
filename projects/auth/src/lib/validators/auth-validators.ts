import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valid = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(value);
    return valid ? null : { invalidName: true };
  };
}

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valid = /^[a-zA-Z0-9]{3,30}$/.test(value);
    return valid ? null : { invalidUsername: true };
  };
}

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return value.trim().length === 0 ? { whitespace: true } : null;
  };
}

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const minLength = 12;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[\W_]/.test(value);
    const valid = value.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;

    return valid ? null : { passwordStrength: true };
  };
}
export function passwordMatchValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get(passwordControlName);
    const confirmPasswordControl = control.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) return null;

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPasswordControl.hasError('passwordMismatch')) {
        confirmPasswordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        confirmPasswordControl.setErrors(null);
      }
      return null;
    }
  };
}
