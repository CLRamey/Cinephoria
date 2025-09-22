import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup } from '@angular/forms';

// Function to display a success message when login is successful
export function loginSuccessSnackBar(snackBar: MatSnackBar): void {
  snackBar.open('Connexion réussie ! Redirection en cours...', 'Fermer', {
    duration: 1000,
    verticalPosition: 'top',
    panelClass: 'snackbar-success',
  });
}

// Function to display an error message when login fails
export function notAuthorizedSnackBar(snackBar: MatSnackBar): void {
  snackBar.open("Vous n'avez pas les droits nécessaires pour accéder à cette page.", 'Fermer', {
    duration: 3000,
    verticalPosition: 'top',
    panelClass: 'snackbar-error',
  });
}

// Function to handle errors during login and display appropriate messages
export function catchErrorSnackBar(snackBar: MatSnackBar): void {
  snackBar.open('Une erreur est survenue. Veuillez réessayer plus tard.', 'Fermer', {
    duration: 3000,
    verticalPosition: 'top',
    panelClass: 'snackbar-error',
  });
}

// Method to reset the form
export function resetForm(loginForm: FormGroup): void {
  loginForm.reset();
  Object.keys(loginForm.controls).forEach(key => {
    const control = loginForm.get(key);
    control?.setErrors(null);
    control?.markAsPristine();
    control?.markAsUntouched();
  });
}

// Method to handle errors in the form.
export function errorForm(loginForm: FormGroup): void {
  loginForm.patchValue({ password: '' });
  Object.keys(loginForm.controls).forEach(key => {
    const control = loginForm.get(key);
    control?.setErrors({ incorrect: true });
    control?.markAsTouched();
    control?.markAsDirty();
  });
}
